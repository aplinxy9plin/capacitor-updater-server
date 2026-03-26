"use client"

import { useEffect, useState } from "react"
import { BookOpen, ExternalLink } from "lucide-react"

export default function DocsPage() {
  const [host, setHost] = useState("")
  useEffect(() => { setHost(window.location.origin) }, [])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Getting Started</h1>
          <p className="mt-1 text-sm text-muted-foreground">Set up OTA updates for your Capacitor app</p>
        </div>
        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          API Reference <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <h3 className="font-semibold text-foreground">Create an App</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Go to <a href="/" className="text-primary underline">Apps</a> and click <strong>New App</strong>.
            Enter a name and the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">appId</code> from
            your <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">capacitor.config.ts</code>.
          </p>
          <pre className="bg-muted/70 rounded-lg p-3 mt-3 ml-10 text-xs font-mono overflow-x-auto">{`// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.example.myapp',  // <- this value
  ...
};`}</pre>
        </section>

        {/* Step 2 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            <h3 className="font-semibold text-foreground">Create an API Key</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Go to <a href="/api-keys" className="text-primary underline">API Keys</a> and click <strong>Create Key</strong>.
            Copy the key — it's shown only once.
          </p>
        </section>

        {/* Step 3 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
            <h3 className="font-semibold text-foreground">Install the plugin</h3>
          </div>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 text-xs font-mono overflow-x-auto">npm install @capgo/capacitor-updater</pre>
        </section>

        {/* Step 4 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
            <h3 className="font-semibold text-foreground">Configure the plugin</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10 mb-3">
            Add the plugin config to your <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">capacitor.config.ts</code>:
          </p>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 text-xs font-mono overflow-x-auto">{`const config: CapacitorConfig = {
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
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">5</span>
            <h3 className="font-semibold text-foreground">Add the API key to your app</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10 mb-3">
            In your app's main file, set the API key and notify the plugin when ready:
          </p>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 text-xs font-mono overflow-x-auto">{`import { CapacitorUpdater } from '@capgo/capacitor-updater';

// Set API key for update server auth
CapacitorUpdater.setCustomId({ id: '' });

// Tell the plugin the update installed successfully
CapacitorUpdater.notifyAppReady();`}</pre>
          <p className="text-sm text-muted-foreground ml-10 mt-3">
            Or configure headers in <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">capacitor.config.ts</code>:
          </p>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 mt-2 text-xs font-mono overflow-x-auto">{`plugins: {
  CapacitorUpdater: {
    updateUrl: '${host || 'https://your-server.com'}/api/update',
    statsUrl: '${host || 'https://your-server.com'}/api/stats',
    headers: {
      'x-api-key': 'sk_your_api_key_here',
    },
  },
},`}</pre>
        </section>

        {/* Step 6 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">6</span>
            <h3 className="font-semibold text-foreground">Build and upload a bundle</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10 mb-3">Build your web assets and zip them:</p>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 text-xs font-mono overflow-x-auto">{`# Build your Capacitor app
npm run build
npx cap sync

# Zip the web assets
cd dist  # or www, depending on your framework
zip -r ../bundle.zip .
cd ..`}</pre>
          <p className="text-sm text-muted-foreground ml-10 mt-3">
            Then go to your app's page, click <strong>Upload Bundle</strong>, enter the version, select the zip, and upload.
          </p>
        </section>

        {/* Step 7 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">7</span>
            <h3 className="font-semibold text-foreground">Activate the bundle</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            On the app's bundle list, click the <strong>play button</strong> next to the uploaded bundle to set it as active.
            Devices will receive this update on the next app launch.
          </p>
        </section>

        {/* Step 8 */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">8</span>
            <h3 className="font-semibold text-foreground">Verify</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10 mb-3">
            Open your app on a device. The plugin checks for updates on launch.
            Check the <a href="/devices" className="text-primary underline">Devices</a> page to see your device.
          </p>
          <pre className="bg-muted/70 rounded-lg p-3 ml-10 text-xs font-mono overflow-x-auto">{`curl -X POST ${host || 'https://your-server.com'}/api/update \\
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
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">API Reference</h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-mono font-bold text-green-600 dark:text-green-400">POST</span>
                <code className="font-mono text-sm">/api/update</code>
              </div>
              <p className="text-xs text-muted-foreground">Check for updates. Returns the download URL and checksum if a new version is available.</p>
            </div>
            <div className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-mono font-bold text-green-600 dark:text-green-400">POST</span>
                <code className="font-mono text-sm">/api/stats</code>
              </div>
              <p className="text-xs text-muted-foreground">Report update status (success/fail). Tracks device versions and update analytics.</p>
            </div>
            <div className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">GET</span>
                <code className="font-mono text-sm">/api/download/:bundleId</code>
              </div>
              <p className="text-xs text-muted-foreground">Download bundle zip file.</p>
            </div>
            <div className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">GET</span>
                <code className="font-mono text-sm">/api/health</code>
              </div>
              <p className="text-xs text-muted-foreground">Health check. Returns DB and MinIO connectivity status.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
