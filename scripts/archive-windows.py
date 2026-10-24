"""Create the ZIP layout consumed by the existing Windows installer."""
import argparse
from pathlib import Path
import zipfile

ARCHIVE_ROOT = "Veyra-win32-x64"
REQUIRED = ("Veyra.exe", "resources/app.asar", "icudtl.dat", "LICENSE")


def validate(archive):
    with zipfile.ZipFile(archive) as zipped:
        names = zipped.namelist()
        prefix = ARCHIVE_ROOT + "/"
        if not names or any(not name.startswith(prefix) for name in names):
            raise ValueError("ZIP must contain only the Veyra-win32-x64 directory")
        if len({name.casefold() for name in names}) != len(names):
            raise ValueError("Duplicate Windows archive paths")
        for name in REQUIRED:
            if prefix + name not in names:
                raise ValueError("Missing required browser file: " + name)
        for name in names:
            parts = name[len(prefix):].rstrip("/").split("/")
            if any(part in ("", ".", "..") or ":" in part or "\\" in part for part in parts):
                raise ValueError("Invalid archive path: " + name)


def create(source, target):
    source, target = Path(source).resolve(), Path(target).resolve()
    if target.is_relative_to(source):
        raise ValueError("Archive output must be outside the browser directory")
    for name in REQUIRED:
        if not (source / name).is_file():
            raise ValueError("Missing required browser file: " + name)
    target.parent.mkdir(parents=True, exist_ok=True)
    # Refuse to overwrite an artifact that may have already been published.
    with zipfile.ZipFile(target, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipped:
        for file in sorted(source.rglob("*")):
            if file.is_symlink():
                raise ValueError("Browser archives must not contain symbolic links")
            if file.is_file():
                zipped.write(file, ARCHIVE_ROOT + "/" + file.relative_to(source).as_posix())
    validate(target)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    create(args.source, args.output)
    print("Created and validated " + str(args.output))
