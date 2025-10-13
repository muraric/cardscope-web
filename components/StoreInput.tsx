"use client";

function StoreInput({
                        store,
                        setStore,
                        onSubmit,
                    }: {
    store: string;
    setStore: (s: string) => void;
    onSubmit: (store: string) => void;
}) {
    return (
        <div className="flex gap-2">
            <input
                className="flex-1 border p-3 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter store name"
                value={store}
                onChange={(e) => setStore(e.target.value)}
            />
            <button
                onClick={() => {
                    if (store.trim()) onSubmit(store);
                }}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
                Search
            </button>
        </div>
    );
}

export default StoreInput;
