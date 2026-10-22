# Optional dependency for this development-only fixture: cryptography.
# The generated key/certificate are never installed in Windows or bundled with Veyra.
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta, timezone
from pathlib import Path
import ipaddress, sys
root = Path(sys.argv[1] if len(sys.argv) > 1 else 'work/qa-tls')
root.mkdir(parents=True, exist_ok=True)
key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Veyra local QA only')])
cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(datetime.now(timezone.utc)-timedelta(minutes=1)).not_valid_after(datetime.now(timezone.utc)+timedelta(days=2)).add_extension(x509.SubjectAlternativeName([x509.DNSName('localhost'),x509.DNSName('upgrade.veyra.test'),x509.IPAddress(ipaddress.ip_address('127.0.0.1'))]),critical=False).sign(key, hashes.SHA256()))
(root/'key.pem').write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
(root/'cert.pem').write_bytes(cert.public_bytes(serialization.Encoding.PEM))
print('Local QA certificate created; it is not installed in Windows.')
