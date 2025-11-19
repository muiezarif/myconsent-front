import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import AgreementScreen from '@/components/AgreementScreen';

const formatFieldLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Id$/, 'ID');
};

const renderValue = (key, value) => {
  if ((key === 'participants' || key === 'releasors') && Array.isArray(value)) {
    const title = key === 'releasors' ? 'Releasor' : 'Participant';
    return (
      <div className="space-y-4 mt-2">
        {value.map((p, index) => (
          <div key={index} className="p-3 border rounded-lg bg-gray-50">
            <p className="font-semibold flex items-center"><User className="w-4 h-4 mr-2" /> {p.role || title} #{index + 1}</p>
            <p><strong>Name:</strong> {p.firstName} {p.lastName}</p>
            <p><strong>Email:</strong> {p.email}</p>
          </div>
        ))}
      </div>
    );
  }
  if (key === 'releasee' && typeof value === 'object' && value !== null) {
    return (
      <div className="mt-2 p-3 border rounded-lg bg-gray-50">
        <p><strong>Name:</strong> {value.name}</p>
        <p><strong>Email:</strong> {value.email}</p>
      </div>
    );
  }
  if (key === 'idPhoto' && value && value.dataUrl) {
    return (
      <div className="mt-2">
        <img src={value.dataUrl} alt="ID Preview" className="max-w-full h-auto rounded-lg border" />
      </div>
    );
  }
  if (typeof value === 'boolean') {
    return value ? '✓ Yes' : '✗ No';
  }
  if (!value) return <span className="text-gray-400">Not specified</span>;
  return <p className="whitespace-pre-wrap">{value.toString()}</p>;
};

const renderSignatures = (signatures) => {
    if (!signatures || !signatures.signatures) return null;

    let sigs = signatures.signatures || [];
  
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Signatures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sigs.map((sig, index) => (
            <div key={index}>
              <p className="text-sm font-medium text-gray-600">{sig.role || `Participant ${index + 1}`}</p>
              <div className="mt-2 p-2 border rounded-md bg-white inline-block">
                <img 
                  src={sig.signature} 
                  alt={`${sig.role} Signature`}
                  className="h-16"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          <strong>Date of Signature:</strong> {signatures.date}
        </p>
      </div>
    );
  };

function FormPreview({ formType, formData, signatures }) {
  const { t } = useTranslation();
  const AgreementComponent = AgreementScreen.getAgreementTextComponent(formType, t);
  const title = t(`agreements.${formType}.title`, { defaultValue: formType });


  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg font-serif text-gray-800">
      <header className="text-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">{title}</h1>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Details</h2>
        <div className="space-y-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <p className="font-semibold text-gray-600">
                {formatFieldLabel(key)}:
              </p>
              <div className="mt-1 pl-4">
                {renderValue(key, value)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {AgreementComponent && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Agreement Terms</h2>
          <div className="prose prose-sm max-w-none">
            <AgreementComponent />
          </div>
        </section>
      )}

      <section>
        {renderSignatures(signatures)}
      </section>
    </div>
  );
}

export default FormPreview;