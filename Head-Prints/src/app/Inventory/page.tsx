'use client';

import { useState } from 'react';
import './page.css';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  location: string;
}

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    supplier: '',
    location: ''
  });

  // Hardcoded inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: 'Laptop Dell XPS', category: 'Electronics', quantity: 45, unit: 'pcs', price: 1200, supplier: 'Dell Inc', location: 'A-01-01' },
    { id: 2, name: 'Office Chair', category: 'Furniture', quantity: 23, unit: 'pcs', price: 150, supplier: 'ErgoMax', location: 'B-02-03' },
    { id: 3, name: 'A4 Paper', category: 'Stationery', quantity: 500, unit: 'pack', price: 5, supplier: 'PaperCorp', location: 'C-01-05' },
    { id: 4, name: 'Printer Ink', category: 'Electronics', quantity: 8, unit: 'pcs', price: 45, supplier: 'HP Store', location: 'A-03-02' },
    { id: 5, name: 'Desk Lamp', category: 'Furniture', quantity: 15, unit: 'pcs', price: 35, supplier: 'LightCorp', location: 'B-01-04' },
    { id: 6, name: 'USB Cable', category: 'Electronics', quantity: 120, unit: 'pcs', price: 12, supplier: 'TechStore', location: 'A-02-01' },
    { id: 7, name: 'Notebook', category: 'Stationery', quantity: 85, unit: 'pcs', price: 8, supplier: 'PaperCorp', location: 'C-02-01' }
  ]);

  const getStockStatus = (quantity: number) => {
    if (quantity > 50) return { class: 'stock-high', text: 'High' };
    if (quantity > 20) return { class: 'stock-medium', text: 'Medium' };
    return { class: 'stock-low', text: 'Low' };
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      price: '',
      supplier: '',
      location: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      supplier: item.supplier,
      location: item.location
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem = {
      id: editItem ? editItem.id : Math.max(...inventory.map(i => i.id)) + 1,
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      price: parseFloat(formData.price),
      supplier: formData.supplier,
      location: formData.location
    };

    if (editItem) {
      setInventory(inventory.map(item => item.id === editItem.id ? newItem : item));
    } else {
      setInventory([...inventory, newItem]);
    }

    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1 className="inventory-title">Inventory Management</h1>
        <button className="add-btn" onClick={handleAdd}>
          + Add Item
        </button>
      </div>

      <div className="inventory-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.quantity);
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>${item.price}</td>
                  <td>{item.supplier}</td>
                  <td>{item.location}</td>
                  <td>
                    <span className={`stock-badge ${stockStatus.class}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-input"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="form-input"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  className="form-input"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}