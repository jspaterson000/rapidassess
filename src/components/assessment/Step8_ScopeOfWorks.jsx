import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-slate-800">Item {index + 1}</h4>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeItem(index)} 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 min-w-[44px] min-h-[44px]"
            title="Remove this item"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium text-base">Description *</Label>
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
              <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-slate-200 text-base">
                <SelectValue placeholder="Select or enter description" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ITEMS.map((preset) => (
                  <SelectItem key={preset.description} value={preset.description}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{preset.description}</span>
                      <span className="text-sm text-slate-500">{formatCurrency(preset.rate)}/{preset.unit}</span>
                    </div>
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
                className="h-12 md:h-14 bg-slate-50 border-slate-200 text-base"
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">Quantity *</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={item.quantity || ''}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                className="h-12 md:h-14 bg-slate-50 border-slate-200 text-base"
                placeholder="0.0"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">Unit *</Label>
              <Input
                value={item.unit || ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="e.g., m2, lm, each"
                className="h-12 md:h-14 bg-slate-50 border-slate-200 text-base"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">Rate (AUD) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.rate || ''}
                onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
                className="h-12 md:h-14 bg-slate-50 border-slate-200 text-base"
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium text-base">Total</Label>
              <div className="h-12 md:h-14 bg-green-50 border border-green-200 rounded-lg flex items-center px-4">
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(item.total || 0)}
                </span>
              </div>
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0);
  };

  const handleContinue = () => {
    onComplete();
  };

  const isFormValid = scopeItems.length > 0 && scopeItems.every(item => 
    item.description && item.quantity > 0 && item.unit && item.rate > 0
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center space-y-4 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm md:text-base font-medium">
          <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Step 8 of 10 • </span>Scope of Works
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Create Repair Quote</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Add line items for repair and replacement work required to restore the property
        </p>
      </div>
      
      <div className="space-y-6 px-4 md:px-0">
        {scopeItems.map((item, index) => (
          <ScopeItemCard 
            key={index}
            index={index}
            item={item}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        ))}

        {scopeItems.length === 0 && (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardContent className="text-center py-12 md:py-16">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">No scope items added yet</h3>
              <p className="text-base md:text-lg text-slate-500 mb-6">Start by adding your first repair item</p>
              <Button 
                onClick={addItem} 
                className="bg-green-600 hover:bg-green-700 text-white h-12 md:h-14 px-6 text-base font-medium min-w-[44px]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        )}

        {scopeItems.length > 0 && (
          <Card 
            className="border-dashed border-2 border-slate-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer" 
            onClick={addItem}
          >
            <CardContent className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <h4 className="text-base md:text-lg font-medium text-slate-700 mb-1">Add Another Item</h4>
              <p className="text-sm md:text-base text-slate-500">Add more repair work items</p>
            </CardContent>
          </Card>
        )}

        {/* Total Summary */}
        {scopeItems.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Total Estimate</h3>
                    <p className="text-sm text-slate-600">{scopeItems.length} line items • Excluding GST</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(getTotalEstimate())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile-Optimized Actions */}
      <div className="px-4 md:px-0">
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="h-12 md:h-14 text-base font-medium min-w-[44px] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous Step</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button 
            onClick={handleContinue} 
            className="flex-1 h-12 md:h-14 text-base font-medium bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-500 min-w-[44px] flex items-center justify-center gap-2"
            disabled={!isFormValid}
          >
            <span>Continue to Report Generation</span>
            <ArrowRight className="w-5 h-5" />
            {isFormValid && <span className="ml-2">✓</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}