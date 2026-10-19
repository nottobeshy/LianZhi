# The wheel loads adjacent CTranslate2/OpenMP DLLs dynamically.
from PyInstaller.utils.hooks import collect_dynamic_libs
binaries = collect_dynamic_libs('ctranslate2')
