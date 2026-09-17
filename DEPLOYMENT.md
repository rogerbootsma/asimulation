# GitHub Pages and Namecheap

Repository: https://github.com/rogerbootsma/asimulation

Publish directory: `dist/`. GitHub Pages source: GitHub Actions.

Intended domain: `asimulation.io`.

For an apex domain, GitHub currently documents these A records:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | rogerbootsma.github.io |

Configure the domain on GitHub before changing DNS. Preserve unrelated MX, TXT, verification, and other service records. If Namecheap uses third-party nameservers, make records at that DNS provider instead. GitHub domain verification uses a unique TXT record supplied by GitHub; do not invent a value. Enable HTTPS when GitHub finishes provisioning its certificate.

Source: [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), checked 2026-09-17.

YouTube banner is 2560 × 1440, with central text and mark constrained to the mobile crop, under 6 MB. Source: [YouTube channel branding](https://support.google.com/youtube/answer/10456525).
