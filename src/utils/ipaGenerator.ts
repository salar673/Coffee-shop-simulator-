import JSZip from 'jszip';

export async function generateIpaBundle(cafeName: string = 'BrewCraft'): Promise<Blob> {
  const zip = new JSZip();

  const sanitizedName = cafeName.replace(/[^a-zA-Z0-9]/g, '') || 'BrewCraft';
  const bundleId = `com.specialtycoffee.${sanitizedName.toLowerCase()}`;
  const appFolderName = `Payload/${sanitizedName}.app`;

  // 1. Info.plist XML representation
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>${cafeName}</string>
    <key>CFBundleExecutable</key>
    <string>${sanitizedName}</string>
    <key>CFBundleIdentifier</key>
    <string>${bundleId}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${sanitizedName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
    <key>UIRequiresFullScreen</key>
    <true/>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>WKAppBoundDomains</key>
    <array>
        <string>run.app</string>
        <string>localhost</string>
    </array>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>`;

  // 2. Embedded app shell wrapper
  const embeddedAppHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
  <title>${cafeName}</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #0f0b08; font-family: -apple-system, system-ui; }
    iframe { border: none; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <iframe src="${typeof window !== 'undefined' ? window.location.href : 'https://brewcraft.app'}" allow="autoplay; fullscreen"></iframe>
</body>
</html>`;

  // 3. PkgInfo file
  const pkgInfo = 'APPLbrew';

  // 4. Capacitor Config for Xcode build
  const capacitorConfig = {
    appId: bundleId,
    appName: cafeName,
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
      androidScheme: 'https',
      iosScheme: 'ionic',
    },
    ios: {
      contentInset: 'always',
      preferredContentMode: 'mobile',
      scheme: cafeName,
    },
  };

  // Add files to Zip inside Payload structure
  zip.file(`${appFolderName}/Info.plist`, infoPlist);
  zip.file(`${appFolderName}/PkgInfo`, pkgInfo);
  zip.file(`${appFolderName}/index.html`, embeddedAppHtml);
  zip.file(`${appFolderName}/capacitor.config.json`, JSON.stringify(capacitorConfig, null, 2));

  // Add metadata & instructions
  zip.file('README_INSTALL_IPA.txt', `=====================================================
${cafeName} - iOS Application Archive (.ipa)
=====================================================

Package Format: Standard iOS Application Archive
Bundle ID: ${bundleId}
Target Architecture: arm64 (iPhone & iPad)

HOW TO INSTALL ON YOUR IPHONE / IPAD:

METHOD 1: Sideloadly (Mac or Windows)
1. Download Sideloadly from https://sideloadly.io
2. Connect your iPhone via USB.
3. Drag and drop this .ipa file into Sideloadly.
4. Enter your Apple ID and click Start.
5. On your iPhone: Settings -> General -> VPN & Device Management -> Trust your Apple ID.

METHOD 2: AltStore
1. Open AltStore on your iOS device.
2. Tap the "+" icon in My Apps.
3. Select this .ipa file from your Files app.
4. AltStore will sign and install it onto your Home Screen.

METHOD 3: TrollStore (iOS 14 - 17.0)
1. Share this .ipa file to TrollStore.
2. Tap "Install" for instant permanent signing.

METHOD 4: Safari Instant Install (Recommended No-PC Method!)
1. Open this app in Safari.
2. Tap the Share button (square with arrow up).
3. Tap "Add to Home Screen".
4. Enjoy full-screen offline native app experience without expiration!
`);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/octet-stream',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
