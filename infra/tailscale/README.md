# Tailscale — sovereign-node mesh

Joins the WSL2 box (`blackwell-wsl`) and the Pixel 10 Pro XL on the same
tailnet so the phone can push voice transcripts to the workstation
without going through the public internet.

## WSL2 side

```bash
bash infra/tailscale/setup-wsl.sh
```

The script:

- Installs the Tailscale daemon if missing.
- Detects whether systemd is running. Uses the systemd service if yes;
  falls back to `tailscaled --tun=userspace-networking` in the background
  if no.
- Runs `tailscale up --ssh --accept-routes --hostname blackwell-wsl`.
  First run prints a login URL — open it in any browser to authorize.
- Prints `tailscale status` and the IPv4 so you can verify from the Pixel.

Override the hostname with `TS_HOSTNAME=...` if you want something other
than `blackwell-wsl`.

## Pixel side

Manual (no script):

1. Install **Tailscale** from the Play Store.
2. Sign in with the same identity used in WSL.
3. The WSL machine should appear in the device list immediately.
4. Optional: enable **MagicDNS** in the Tailscale admin console so the
   phone can reach the workstation by name (`blackwell-wsl`) instead of
   IP.

## Smoke test

From a second WSL terminal or the Pixel's Termux:

```bash
ping -c 3 blackwell-wsl   # if MagicDNS is on
# or
ping -c 3 <ipv4-from-tailscale-status>
```

A response confirms the mesh is up. Failure → check that both nodes
appear in the Tailscale admin console with green "Connected" status.

## Notes

- `--ssh` enables Tailscale SSH on the WSL box. You can `tailscale ssh
  blackwell-wsl` from the Pixel's app or another peer without
  configuring OpenSSH separately.
- Userspace networking (the systemd-less fallback) works fine for
  pull-style sync (Pixel → WSL HTTP endpoint), but cannot serve as an
  exit node. Enable systemd in `/etc/wsl.conf` if you need full TUN.
- This setup does not advertise the WSL box as an exit node. Add
  `--advertise-exit-node` to the `tailscale up` invocation only if you
  intend to route Pixel traffic through it (and approve the route in
  the admin console).
