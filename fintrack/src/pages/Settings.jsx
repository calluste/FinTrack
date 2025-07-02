function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
          <input
            type="text"
            value="Nathan Liriano"
            disabled
            className="w-full p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value="nathan.liviano@gmail.com"
            disabled
            className="w-full p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        <div className="text-sm text-zinc-500">
          This information will come from your account once login is connected.
        </div>
      </div>
    </div>
  );
}

export default Settings;
