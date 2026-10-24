# Veyra VPN design

The 0.7.0 Windows and 0.5.0 Android releases do not provide a VPN connection. Changing a user agent, reporting focus or filtering advertisements does not hide an IP address.

## First implementation

Use WireGuard with a server controlled by the user. Start with importing an existing configuration. This makes a prototype possible without selling bandwidth or claiming to operate a free server network. Cloudflare Workers hosts the account API; it is not a general WireGuard tunnel endpoint.

On Windows, integrate the official WireGuard tunnel service through a small, separately reviewed privileged helper. Keep the browser process unprivileged. Installing a tunnel service requires an explicit operating system elevation prompt. Signing the installer and helper requires a separate certificate and budget decision.

On Android, use VpnService with explicit system consent and a persistent connection notification. Start with tunneling only Veyra using an allowed application list. Offer whole device tunneling only as a separate, clearly described option. Handle network changes, suspension and process death without silently falling back to an unprotected connection when the user selected a kill switch.

## Key and account boundaries

Generate a distinct WireGuard private key for each device. Store it using Windows protection or Android Keystore backed encryption. Never put shared tunnel private keys in the browser package, repository, Supabase records or logs. The account service may store the public key, region, entitlement and revocation state.

Issue short lived provisioning requests through the existing account session. Revalidate device revocation before provisioning. Keep the password and bookmark encryption boundaries separate from VPN keys. An account deletion revokes provisioning and removes device records.

## Network requirements

Route DNS through the tunnel and define IPv6 behavior explicitly. A kill switch must block traffic during reconnect and disconnect, with an explicit local network exception if the user enables it. Test WebRTC, DNS, IPv4, IPv6, captive portals, split tunneling and a server becoming unreachable. A browser proxy can be offered independently, but must be labelled as a proxy rather than a VPN.

## Commercial service

A hosted network needs paid servers, bandwidth, abuse handling, regional capacity, monitoring and a clear retention policy. The current free hosting authorization does not include provisioning that infrastructure. Begin with a user supplied server. Consider a paid managed offering only after measuring bandwidth costs and documenting the service policies.

## Acceptance gates

Verify that the visible public IP changes, DNS leaves through the tunnel and IPv6 cannot bypass it. Disconnect the server during an active download and confirm that the kill switch prevents an unprotected retry. Revoke a device and verify that a new connection is denied. Complete platform testing and a separate security review before advertising VPN protection.

## Implementation references

[WireGuard embedding](https://www.wireguard.com/embedding/)

[WireGuard for Windows](https://git.zx2c4.com/wireguard-windows/)

[Android VpnService](https://developer.android.com/reference/android/net/VpnService)
