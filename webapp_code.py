web_app_code = """'use client';

import { useState, useEffect } from 'react';

interface Item {
  id: number;
  name: string;
  description: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  const handleCreate = () => {
    if (name.trim() && description.trim()) {
      const newItem: Item = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
      };
      setItems([...items, newItem]);
      setName('');
      setDescription('');
    }
  };

  const handleUpdate = () => {
    if (editingId !== null && name.trim() && description.trim()) {
      setItems(items.map(item => 
        item.id === editingId 
          ? { ...item, name: name.trim(), description: description.trim() }
          : item
      ));
      setEditingId(null);
      setName('');
      setDescription('');
    }
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          CRUD Application
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            {editingId ? 'Edit Item' : 'Create New Item'}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Create
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No items yet. Create your first item!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
"""
