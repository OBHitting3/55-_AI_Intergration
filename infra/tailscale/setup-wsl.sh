#!/usr/bin/env bash
# Tailscale bring-up inside WSL2 Ubuntu (sovereign node, 5090 workstation).
#
# Runs interactively the first time — `tailscale up` prints a login URL
# you open in any browser to bind this machine to your tailnet. Subsequent
# runs are no-ops if the daemon is already authenticated.
#
# Flags chosen:
#   --ssh             enable Tailscale SSH (reach this box from the Pixel)
#   --accept-routes   accept subnet routes advertised by other tailnet peers
#   --hostname        explicit so the Pixel sees a stable name

set -euo pipefail

HOSTNAME_TAG="${TS_HOSTNAME:-blackwell-wsl}"

log() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\n\033[1;31m[fatal]\033[0m %s\n' "$*" >&2; exit 1; }

log "Step 1/4: Install Tailscale (idempotent)"
if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | sh
else
  log "tailscale already installed: $(tailscale version | head -n1)"
fi

log "Step 2/4: Check systemd / fall back to userspace if needed"
USERSPACE_FLAG=""
if ! pidof systemd >/dev/null 2>&1; then
  log "systemd not running in this WSL distro — will use userspace networking."
  log "To enable systemd permanently: add 'systemd=true' under [boot] in /etc/wsl.conf and 'wsl --shutdown' from PowerShell."
  USERSPACE_FLAG="--tun=userspace-networking"
  # Start tailscaled manually in background if not already up.
  if ! pgrep -x tailscaled >/dev/null 2>&1; then
    sudo tailscaled $USERSPACE_FLAG >/tmp/tailscaled.log 2>&1 &
    sleep 2
  fi
else
  log "systemd OK — tailscaled is a managed service."
  sudo systemctl enable --now tailscaled
fi

log "Step 3/4: tailscale up (interactive auth on first run)"
# shellcheck disable=SC2086
sudo tailscale up \
  --ssh \
  --accept-routes \
  --hostname "$HOSTNAME_TAG"

log "Step 4/4: Status"
tailscale status
echo
echo "Tailnet IP for this node:"
tailscale ip -4 || true
echo
cat <<EOF
Pixel side:
  1. Install Tailscale from the Play Store on the Pixel 10 Pro XL.
  2. Sign in with the same identity.
  3. From the Pixel, ping this host by name: ${HOSTNAME_TAG}
  4. (Optional) Enable MagicDNS in the admin console for name-based reach.

Sanity check from the Pixel's Tailscale app:
  - This machine appears in the device list.
  - Tapping it shows the same IPv4 printed above.
EOF
