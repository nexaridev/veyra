"""Generate a temporary certificate for loopback-only Electron test fixtures."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
import sys
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

directory = Path(sys.argv[1])
key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Veyra local test only')])
now = datetime.now(timezone.utc)
cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name)
        .public_key(key.public_key()).serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(minutes=5)).not_valid_after(now + timedelta(days=1))
        .add_extension(x509.SubjectAlternativeName([x509.DNSName('accounts.google.com'), x509.DNSName('claude.veyra.test'), x509.DNSName('thirdparty.external.test')]), critical=False)
        .sign(key, hashes.SHA256()))
(directory / 'fixture-key.pem').write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
(directory / 'fixture-cert.pem').write_bytes(cert.public_bytes(serialization.Encoding.PEM))
