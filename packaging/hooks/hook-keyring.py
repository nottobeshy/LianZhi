# Application explicitly uses WinVaultKeyring; do not collect unrelated backend plugins.
from PyInstaller.utils.hooks import copy_metadata
hiddenimports = ['keyring.backends.Windows', 'win32ctypes.pywin32.win32cred']
datas = copy_metadata('keyring')
