"""Provedor Hermes isolado usando apenas o cliente oficial Codex com OAuth.

Não lê/exporta tokens, chama endpoints internos ou habilita ferramentas textuais.
O registro/dispatch usa a ABC e o registry do checkout Hermes dedicado.
"""
import base64
import json
import os
from pathlib import Path
import subprocess
import sys

sys.path.insert(0, os.getcwd())  # cwd fixo definido por scripts/hermes-local.js
from agent.image_gen_provider import ImageGenProvider, save_b64_image, success_response
from agent import image_gen_registry

NAME = "inteagir-openai-oauth"
ROOT = Path(__file__).resolve().parents[2]


class OfficialCodexImages(ImageGenProvider):
    name = NAME
    display_name = "OpenAI OAuth — cliente Codex oficial"

    def generate(self, prompt, aspect_ratio="landscape", *, image_url=None,
                 reference_image_urls=None, **kwargs):
        if image_url or reference_image_urls:
            raise ValueError("Somente texto para imagem no MVP.")
        if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 6000:
            raise ValueError("Pedido inválido.")
        result = subprocess.run(
            [sys.argv[1], str(ROOT / "scripts/check-codex-image-local.js"), "--worker"],
            input=json.dumps({"pedido": prompt}, ensure_ascii=False), text=True, encoding="utf-8",
            capture_output=True, timeout=315, check=True, cwd=ROOT,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        if len(result.stdout) > 14 * 1024 * 1024:
            raise ValueError("Saída excedeu limite.")
        payload = json.loads(result.stdout)
        if payload.get("provider") != "openai-codex":
            raise ValueError("Provedor inesperado.")
        data = base64.b64decode(payload["png"], validate=True)
        if not data or len(data) > 10 * 1024 * 1024 or not data.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError("Imagem inválida.")
        filename = save_b64_image(payload["png"], prefix="inteagir_codex", extension="png")
        # Motor de imagem gerido pelo serviço: não inventar id de modelo.
        return success_response(image=str(filename), model="", prompt="",
                                aspect_ratio=aspect_ratio, provider="openai-codex")


def main():
    payload = json.loads(sys.stdin.read(16001))
    provider = OfficialCodexImages()
    image_gen_registry.register_provider(provider)
    selected = image_gen_registry.get_provider(NAME)
    if selected is not provider:
        raise ValueError("Registro de provedor não confirmado.")
    result = selected.generate(payload.get("pedido"))
    result.update(bridge="hermes-image-registry", selected=NAME)
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # Nunca devolver traceback, prompt, credenciais ou stderr do cliente.
        print(json.dumps({"success": False, "error": "Não foi possível gerar imagem OpenAI OAuth pelo Hermes."}))
        sys.exit(1)
