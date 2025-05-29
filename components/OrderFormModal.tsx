
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Order, OrderFormData, OrderItemFormData, OrderItem } from '../types';
import { PlusIcon, TrashIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from './icons'; // Added Chevron icons & CheckCircleIcon

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: OrderFormData, itemsData: OrderItem[]) => Promise<void>;
  initialOrder?: Order | null;
}

const defaultFormData: OrderFormData = {
  customerName: '',
  phoneNumber: '',
  address: '',
  city: '',
  price: '',
  currencySymbol: 'PKR',
  paymentMethod: 'COD',
  deliveryMethod: 'TCS',
};

const defaultItem: OrderItemFormData = { name: '', quantity: '1' };

const STEPS = [
  { id: 1, title: 'Customer Information' },
  { id: 2, title: 'Order Items' },
  { id: 3, title: 'Payment & Delivery' },
];

export const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, onSave, initialOrder }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>(defaultFormData);
  const [items, setItems] = useState<OrderItemFormData[]>([defaultItem]);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData | 'items' | 'form' | `itemName${number}` | `itemQuantity${number}`, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) { // Reset form state when modal opens
        setCurrentStep(1);
        if (initialOrder) {
        setFormData({
            customerName: initialOrder.customerName,
            phoneNumber: initialOrder.phoneNumber,
            address: initialOrder.address,
            city: initialOrder.city,
            price: String(initialOrder.price),
            currencySymbol: initialOrder.currencySymbol,
            paymentMethod: initialOrder.paymentMethod,
            deliveryMethod: initialOrder.deliveryMethod || 'TCS',
        });
        setItems(initialOrder.items.map(item => ({ name: item.name, quantity: String(item.quantity) })));
        } else {
        setFormData(defaultFormData);
        setItems([{ name: '', quantity: '1' }]);
        }
        setErrors({});
    }
  }, [initialOrder, isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};
    if (step === 1) {
      if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required.';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
      else if (!/^92\d{10}$/.test(formData.phoneNumber.trim())) newErrors.phoneNumber = 'Phone must be in 92XXXXXXXXXX format.';
      if (!formData.address.trim()) newErrors.address = 'Address is required.';
      if (!formData.city.trim()) newErrors.city = 'City is required.';
    } else if (step === 2) {
      items.forEach((item, index) => {
          if (!item.name.trim()) newErrors[`itemName${index}`] = 'Item name is required.';
          if (!item.quantity.trim()) newErrors[`itemQuantity${index}`] = 'Quantity is required.';
          else if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) newErrors[`itemQuantity${index}`] = 'Quantity must be a positive integer.';
      });
      if (items.length === 0 || items.every(item => !item.name.trim())) newErrors.items = 'At least one item with a name is required.';
    } else if (step === 3) {
      if (!formData.price.trim()) newErrors.price = 'Price is required.';
      else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number.';
      // Payment method and delivery method have defaults, usually not empty.
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateAll = (): boolean => {
    // Consolidate all validations
    const newErrors: typeof errors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required.';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
    else if (!/^92\d{10}$/.test(formData.phoneNumber.trim())) newErrors.phoneNumber = 'Phone must be in 92XXXXXXXXXX format.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    
    items.forEach((item, index) => {
        if (!item.name.trim()) newErrors[`itemName${index}`] = 'Item name is required.';
        if (!item.quantity.trim()) newErrors[`itemQuantity${index}`] = 'Quantity is required.';
        else if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) newErrors[`itemQuantity${index}`] = 'Quantity must be a positive integer.';
    });
    if (items.length === 0 || items.every(item => !item.name.trim())) newErrors.items = 'At least one item with a name is required.';

    if (!formData.price.trim()) newErrors.price = 'Price is required.';
    else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name as keyof OrderItemFormData]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { ...defaultItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    setIsSubmitting(true);
    const processedItems: OrderItem[] = items.map(item => ({
      name: item.name,
      quantity: parseInt(item.quantity, 10),
    }));

    try {
      await onSave(formData, processedItems);
      onClose(); 
    } catch (error) {
      console.error("Failed to save order:", error);
      setErrors(prev => ({...prev, form: "Failed to save order. Please try again."}));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const InputField: React.FC<{label: string, name: keyof OrderFormData, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, type?: string, required?: boolean, placeholder?: string}> = 
    ({label, name, value, onChange, error, type="text", required=true, placeholder}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
  
  const SelectField: React.FC<{label: string, name: keyof OrderFormData, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, error?: string, options: {value: string, label: string}[], required?: boolean}> =
    ({label, name, value, onChange, error, options, required=true}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialOrder ? 'Edit Order' : 'Create New Order'} size="3xl">
      {/* Stepper Indicators */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center mb-6">
          {STEPS.map((step, stepIdx) => (
            <li key={step.id} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {currentStep > step.id ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-purple-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.title}</span>
                  </button>
                </>
              ) : currentStep === step.id ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-purple-600 bg-white"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-600" aria-hidden="true" />
                    <span className="sr-only">{step.title}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <button
                    type="button"
                    disabled // Prevent going to future unvalidated steps
                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                    <span className="sr-only">{step.title}</span>
                  </button>
                </>
              )}
               <p className="absolute -bottom-6 w-max text-center text-xs font-medium text-gray-600" style={{left: '50%', transform: 'translateX(-50%)'}}>{step.title}</p>
            </li>
          ))}
        </ol>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-6 mt-10">
        {/* Step 1: Customer Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} error={errors.customerName} />
              <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="923001234567" />
            </div>
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
            <InputField label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
          </div>
        )}

        {/* Step 2: Order Items */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Items {errors.items && <span className="text-xs text-red-600">({errors.items})</span>}</h3>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="col-span-12 sm:col-span-7">
                  <label htmlFor={`itemName${index}`} className="block text-xs font-medium text-gray-600">Item Name<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    id={`itemName${index}`}
                    placeholder="E.g., Wireless Mouse"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`mt-1 block w-full px-2 py-1.5 border ${errors[`itemName${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                  />
                  {errors[`itemName${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`itemName${index}`]}</p>}
                </div>
                <div className="col-span-8 sm:col-span-3">
                  <label htmlFor={`itemQuantity${index}`} className="block text-xs font-medium text-gray-600">Quantity<span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="quantity"
                    id={`itemQuantity${index}`}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    min="1"
                    className={`mt-1 block w-full px-2 py-1.5 border ${errors[`itemQuantity${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                  />
                  {errors[`itemQuantity${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`itemQuantity${index}`]}</p>}
                </div>
                <div className="col-span-4 sm:col-span-2 flex items-end h-full">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add Item
            </button>
          </div>
        )}
        
        {/* Step 3: Payment & Delivery */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Total Price" name="price" value={formData.price} onChange={handleChange} error={errors.price} type="number" placeholder="e.g., 1500"/>
              <SelectField 
                label="Currency" 
                name="currencySymbol" 
                value={formData.currencySymbol} 
                onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))} 
                options={[{value: "PKR", label: "PKR"}]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Payment Method" 
                name="paymentMethod" 
                value={formData.paymentMethod} 
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} 
                options={[{value: "COD", label: "Cash on Delivery"}, {value: "Easypaisa (Advance)", label: "Easypaisa (Advance)"}, {value: "Bank Transfer (Advance)", label: "Bank Transfer (Advance)"}]}
              />
              <SelectField 
                label="Delivery Method" 
                name="deliveryMethod" 
                value={formData.deliveryMethod} 
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value }))} 
                options={[{value: "TCS", label: "TCS"}, {value: "Leopards", label: "Leopards"}, {value: "Other", label: "Other"}]}
              />
            </div>
          </div>
        )}
        
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
              </button>
            )}
            {currentStep < STEPS.length && (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
              >
                Next <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            )}
            {currentStep === STEPS.length && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (initialOrder ? 'Save Changes' : 'Create Order')}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
