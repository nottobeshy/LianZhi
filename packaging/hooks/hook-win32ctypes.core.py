# pywin32-ctypes redirects these seven aliases via importlib at runtime.
# cffi is already required by pythonnet; select its matching backend explicitly.
hiddenimports = ['win32ctypes.core.cffi.'+name for name in (
    '_dll','_authentication','_time','_common','_resource','_nl_support','_system_information')]
