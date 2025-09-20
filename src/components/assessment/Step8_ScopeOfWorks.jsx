
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PRESET_ITEMS = [
  { description: 'Ceiling Plaster Repair', unit: 'm2', rate: 85 },
  { description: 'Wall Plaster Repair', unit: 'm2', rate: 75 },
  { description: 'Paint Interior Ceiling', unit: 'm2', rate: 25 },
  { description: 'Paint Interior Wall', unit: 'm2', rate: 22 },
  { description: 'Carpet Replacement', unit: 'm2', rate: 55 },
  { description: 'Timber Flooring Replacement', unit: 'm2', rate: 120 },
  { description: 'Roof Tile Replacement', unit: 'each', rate: 15 },
  { description: 'Gutter Replacement', unit: 'lm', rate: 45 },
  { description: 'Window Replacement', unit: 'each', rate: 850 },
  { description: 'Door Replacement', unit: 'each', rate: 650 },
];

function ScopeItemCard({ item, index, updateItem, removeItem }) {
  const handleChange = (field, value) => {
    const updatedItem = { ...item, [field]: value };
    if (field === 'quantity' || field === 'rate') {
      updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.rate || 0);
    }
    updateItem(index, updatedItem);
  };

  return (
    <Card className="card-neumorphic border-0 p-4">
      <CardContent className="space-y-4 p-0">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-neumorphic-dark">Item {index + 1}</h4>
          <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label className="text-neumorphic-dark font-medium">Description</Label>
            <Select
              value={item.description || ''}
              onValueChange={(value) => {
                const preset = PRESET_ITEMS.find(p => p.description === value);
                if (preset) {
                  handleChange('description', preset.description);
                  handleChange('unit', preset.unit);
                  handleChange('rate', preset.rate);
                } else {
                  handleChange('description', value);
                }
              }}
            >
              <SelectTrigger className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark">
                <SelectValue placeholder="Select or enter description" />
              </SelectTrigger>
              <SelectContent style={{ background: '#e0e0e0' }}>
                {PRESET_ITEMS.map((preset) => (
                  <SelectItem key={preset.description} value={preset.description}>
                    {preset.description} (${preset.rate}/{preset.unit})
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Item...</SelectItem>
              </SelectContent>
            </Select>
            
            {item.description === 'custom' && (
              <Input
                value={item.custom_description || ''}
                onChange={(e) => handleChange('custom_description', e.target.value)}
                placeholder="Enter custom description..."
                className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-neumorphic-dark font-medium">Quantity</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={item.quantity || ''}
              onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
              className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-neumorphic-dark font-medium">Unit</Label>
            <Input
              value={item.unit || ''}
              onChange={(e) => handleChange('unit', e.target.value)}
              placeholder="e.g., m2, lm, each"
              className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-neumorphic-dark font-medium">Rate ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.rate || ''}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
              className="neumorphic-inset border-0 bg-transparent text-neumorphic-dark"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-neumorphic-dark font-medium">Total</Label>
            <div className="p-2 neumorphic-inset rounded-md">
              <span className="font-semibold text-neumorphic-dark">
                ${(item.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Step8_ScopeOfWorks({ scopeOfWorks = [], onUpdate, onComplete, onBack }) {
  const [scopeItems, setScopeItems] = useState(scopeOfWorks || []);

  const addItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unit: '',
      rate: 0,
      total: 0
    };
    const newItems = [...scopeItems, newItem];
    setScopeItems(newItems);
    onUpdate(newItems);
  };

  const removeItem = (indexToRemove) => {
    const newItems = scopeItems.filter((_, index) => index !== indexToRemove);
    setScopeItems(newItems);
    onUpdate(newItems);
  };

  const updateItem = (index, updatedItem) => {
    const newItems = [...scopeItems];
    newItems[index] = updatedItem;
    setScopeItems(newItems);
    onUpdate(newItems);
  };

  const getTotalEstimate = () => {
    return scopeItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neumorphic-dark mb-2">Scope of Works</h2>
        <p className="text-neumorphic">Add line items for repair and replacement work required.</p>
      </div>
      
      <div className="space-y-4">
        {scopeItems.map((item, index) => (
          <ScopeItemCard 
            key={index}
            index={index}
            item={item}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        ))}
      </div>

      <Button onClick={addItem} className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Line Item
      </Button>

      {/* Total Summary */}
      <div className="p-6 neumorphic-inset rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-neumorphic-dark" />
            <span className="text-lg font-semibold text-neumorphic-dark">Total Estimate</span>
          </div>
          <span className="text-2xl font-bold text-neumorphic-dark">
            ${getTotalEstimate().toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-neumorphic mt-2">
          {scopeItems.length} line items • Excluding GST
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
        <Button onClick={onBack} className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm w-full sm:w-auto">
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          className="bg-slate-700 hover:bg-slate-800 text-white shadow-sm w-full sm:w-auto"
          disabled={scopeItems.length === 0}
        >
          Continue to Report Generation
        </Button>
      </div>
    </div>
  );
}
