"use client"

import { useEffect, useState } from "react"

export default function DocsPage() {
  const [host, setHost] = useState("")
  useEffect(() => { setHost(window.location.origin) }, [])

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Getting Started</h2>
        <a href="/api/docs" target="_blank" rel="noopener noreferrer"
          className="text-sm text-primary hover:underline">Interactive API Reference &rarr;</a>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">1</span>
            <h3 className="font-semibold">Create an App</h3>
          </div>
          <p className="text-muted-foreground ml-8">
            Go to <a href="/" className="text-primary underline">Apps</a> and click <strong>New App</strong>.
            Enter a name and the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code> from
            your <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">capacitor.config.ts</code>.
          </p>
          <pre className="bg-muted rounded-lg p-3 mt-2 ml-8 text-sm font-mono overflow-x-auto">{`// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.example.myapp',  // ← this value
  ...
};`}</pre>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">2</span>
            <h3 className="font-semibold">Create an API Key</h3>
          </div>
          <p className="text-muted-foreground ml-8">
            Go to <a href="/api-keys" className="text-primary underline">API Keys</a> and click <strong>Create Key</strong>.
            Copy the key — it's shown only once. You'll need it in the next step.
          </p>
        </section>

        {/* Step 3 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">3</span>
            <h3 className="font-semibold">Install the plugin</h3>
          </div>
          <pre className="bg-muted rounded-lg p-3 ml-8 text-sm font-mono overflow-x-auto">npm install @capgo/capacitor-updater</pre>
        </section>

        {/* Step 4 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">4</span>
            <h3 className="font-semibold">Configure the plugin</h3>
          </div>
          <p className="text-muted-foreground ml-8 mb-2">
            Add the plugin config to your <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">capacitor.config.ts</code>:
          </p>
          <pre className="bg-muted rounded-lg p-3 ml-8 text-sm font-mono overflow-x-auto">{`const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  plugins: {
    CapacitorUpdater: {
      updateUrl: '${host || 'https://your-server.com'}/api/update',
      statsUrl: '${host || 'https://your-server.com'}/api/stats',
      privateKey: '',  // leave empty for v1
    },
  },
};`}</pre>
        </section>

        {/* Step 5 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">5</span>
            <h3 className="font-semibold">Add the API key to your app</h3>
          </div>
          <p className="text-muted-foreground ml-8 mb-2">
            In your app's main file, set the API key and notify the plugin when the app is ready:
          </p>
          <pre className="bg-muted rounded-lg p-3 ml-8 text-sm font-mono overflow-x-auto">{`import { CapacitorUpdater } from '@capgo/capacitor-updater';

// Set API key for update server auth
CapacitorUpdater.setCustomId({ id: '' });

// Tell the plugin the update installed successfully
// (prevents auto-rollback)
CapacitorUpdater.notifyAppReady();`}</pre>
          <p className="text-muted-foreground ml-8 mt-2">
            The API key is sent via the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">x-api-key</code> header
            automatically by the plugin. If the plugin doesn't support custom headers natively, you may need
            to configure it in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">capacitor.config.ts</code>:
          </p>
          <pre className="bg-muted rounded-lg p-3 ml-8 mt-2 text-sm font-mono overflow-x-auto">{`plugins: {
  CapacitorUpdater: {
    updateUrl: '${host || 'https://your-server.com'}/api/update',
    statsUrl: '${host || 'https://your-server.com'}/api/stats',
    // Some versions support headers directly:
    headers: {
      'x-api-key': 'sk_your_api_key_here',
    },
  },
},`}</pre>
        </section>

        {/* Step 6 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">6</span>
            <h3 className="font-semibold">Build and upload a bundle</h3>
          </div>
          <p className="text-muted-foreground ml-8 mb-2">
            Build your web assets, zip them, and upload:
          </p>
          <pre className="bg-muted rounded-lg p-3 ml-8 text-sm font-mono overflow-x-auto">{`# Build your Capacitor app
npm run build
npx cap sync

# Zip the web assets
cd dist  # or www, depending on your framework
zip -r ../bundle.zip .
cd ..`}</pre>
          <p className="text-muted-foreground ml-8 mt-2">
            Then go to your app's page in the dashboard, click <strong>Upload Bundle</strong>,
            enter the version (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">1.0.1</code>),
            select the zip file, and upload.
          </p>
        </section>

        {/* Step 7 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">7</span>
            <h3 className="font-semibold">Activate the bundle</h3>
          </div>
          <p className="text-muted-foreground ml-8">
            On the app's bundle list, click the <strong>play button</strong> next to the uploaded bundle to set it as active.
            Devices will receive this update on the next app launch.
          </p>
        </section>

        {/* Step 8 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0">8</span>
            <h3 className="font-semibold">Verify</h3>
          </div>
          <p className="text-muted-foreground ml-8 mb-2">
            Open your app on a device or emulator. The plugin will check for updates on launch.
            Check the <a href="/devices" className="text-primary underline">Devices</a> page —
            your device should appear with its current version.
          </p>
          <p className="text-muted-foreground ml-8">
            You can also verify the API directly:
          </p>
          <pre className="bg-muted rounded-lg p-3 ml-8 mt-2 text-sm font-mono overflow-x-auto">{`curl -X POST ${host || 'https://your-server.com'}/api/update \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_your_api_key_here" \\
  -d '{
    "device_id": "test-device",
    "app_id": "com.example.myapp",
    "version_name": "0.0.1",
    "platform": "ios"
  }'`}</pre>
        </section>

        {/* API Reference */}
        <section className="border-t border-border pt-6">
          <h3 className="font-semibold mb-3">API Reference</h3>
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-xs font-mono font-bold">POST</span>
                <code className="font-mono text-sm">/api/update</code>
              </div>
              <p className="text-sm text-muted-foreground">Check for updates. Returns the download URL and checksum if a new version is available.</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-xs font-mono font-bold">POST</span>
                <code className="font-mono text-sm">/api/stats</code>
              </div>
              <p className="text-sm text-muted-foreground">Report update status (success/fail). Tracks device versions and update analytics.</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono font-bold">GET</span>
                <code className="font-mono text-sm">/api/download/:bundleId</code>
              </div>
              <p className="text-sm text-muted-foreground">Download bundle zip. Requires <code className="bg-muted px-1 rounded font-mono">x-api-key</code> header.</p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono font-bold">GET</span>
                <code className="font-mono text-sm">/api/health</code>
              </div>
              <p className="text-sm text-muted-foreground">Health check. Returns DB and MinIO connectivity status.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
