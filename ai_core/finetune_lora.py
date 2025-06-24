from peft import get_peft_model, LoraConfig
from transformers import AutoModelForCausalLM

def lora_tune(model_name):
    model = AutoModelForCausalLM.from_pretrained(model_name)
    lora_config = LoraConfig(...)
    return get_peft_model(model, lora_config)
