import ast

def check_for_vulnerabilities(file):
    with open(file) as f:
        tree = ast.parse(f.read(), filename=file)
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'eval':
            print(f"🚨 Use of eval() found in {file}")
