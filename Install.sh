npm install -g @vscode/vsce
vsce package
code --install-extension project-pilot-0.1.0.vsix

$ cd projectpilotAI
$ vsce package
# myExtension.vsix generated
$ vsce publish
# <publisher id>.myExtension published to VS Code Marketplace

vsce login projectpilotAI


conda activate your-environment
python -m pip install --pre -U -f https://mlc.ai/wheels mlc-llm-nightly-cpu mlc-ai-nightly-cpu

conda install -c conda-forge git-lfs

# clone from GitHub
git clone --recursive https://github.com/mlc-ai/mlc-llm.git && cd mlc-llm/
# create build directory
mkdir -p build && cd build
# generate build configuration
python ../cmake/gen_cmake_config.py
# build mlc_llm libraries
cmake .. && cmake --build . --parallel $(nproc) && cd ..

# make sure to start with a fresh environment
conda env remove -n mlc-chat-venv
# create the conda environment with build dependency
conda create -n mlc-chat-venv -c conda-forge \
    "cmake>=3.24" \
    rust \
    git \
    python=3.11
# enter the build environment
conda activate mlc-chat-venv

# Bash
$ rustup completions bash > ~/.local/share/bash-completion/completions/rustup

# Bash (macOS/Homebrew)
$ rustup completions bash > $(brew --prefix)/etc/bash_completion.d/rustup.bash-completion

# Fish
$ mkdir -p ~/.config/fish/completions
$ rustup completions fish > ~/.config/fish/completions/rustup.fish

# Zsh
$ rustup completions zsh > ~/.zfunc/_rustup

# PowerShell v5.0+
$ rustup completions powershell >> $PROFILE.CurrentUserCurrentHost
# or
$ rustup completions powershell | Out-String | Invoke-Expression
$ rustup set default-host i686-pc-windows-msvc
$ rustup toolchain install stable-gnu
curl https://sh.rustup.rs -sSf | sh
Rust is installed now. Great!
git clone https://github.com/rust-lang/cargo.git
cd cargo

cargo build --release
