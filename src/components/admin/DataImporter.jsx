import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, Download, AlertTriangle } from 'lucide-react';

const DataImporter = ({ dataType, onImport }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const templates = {
    inventory: {
      headers: ['name', 'category', 'price', 'costPrice', 'stock', 'lowStockAlert', 'barcode'],
      fileName: 'inventory_template.xlsx',
    },
    staff: {
      headers: ['name', 'role', 'username', 'email', 'password'],
      fileName: 'staff_template.xlsx',
    },
    expenses: {
      headers: ['description', 'amount'],
      fileName: 'expenses_template.xlsx',
    },
  };

  const currentTemplate = templates[dataType];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([currentTemplate.headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`);
    XLSX.writeFile(wb, currentTemplate.fileName);
  };

  const handleProcessImport = () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please choose an Excel file to import.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = jsonData[0].map(h => h.trim());
        const expectedHeaders = currentTemplate.headers;

        if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
           toast({
            title: 'Invalid file structure',
            description: `Headers do not match template. Expected: ${expectedHeaders.join(', ')}`,
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }

        const dataRows = jsonData.slice(1).map(row => {
          let obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        }).filter(row => Object.values(row).some(val => val !== undefined && val !== null && val !== '')); // Filter out empty rows

        if(dataRows.length === 0) {
            toast({
                title: 'No Data Found',
                description: 'The uploaded file appears to be empty or contains no data rows.',
                variant: 'destructive'
            });
            setIsProcessing(false);
            return;
        }

        onImport(dataRows);
        toast({ title: 'Import Successful', description: `${dataRows.length} rows processed for ${dataType}.` });
        
      } catch (error) {
        console.error("Import error:", error);
        toast({ title: 'Import Failed', description: 'There was an error processing your file. Please check the format.', variant: 'destructive' });
      } finally {
        setIsProcessing(false);
        setFile(null);
      }
    };
    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({ title: 'File Read Error', description: 'Could not read the selected file.', variant: 'destructive' });
        setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
       <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-yellow-200">Important Instructions</h4>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-200/90 space-y-1">
                    <li>Always use the provided template to ensure correct formatting.</li>
                    <li>Do not change the column headers in the template file.</li>
                    <li>Ensure all required fields (e.g., name, price) are filled.</li>
                </ul>
            </div>
          </div>
        </div>

      <div className="space-y-2">
        <Label className="text-amber-200">Step 1: Download Template</Label>
        <Button variant="outline" onClick={handleDownloadTemplate} className="w-full border-amber-700 hover:bg-amber-900/50">
          <Download className="w-4 h-4 mr-2" />
          Download {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Template
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-amber-200">Step 2: Upload Completed File</Label>
        <Input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="bg-black/20 border-amber-800/50 text-amber-100 file:text-amber-200 file:bg-amber-800/50 file:border-0 file:rounded-md file:mr-2 file:px-2"
        />
      </div>

      <Button onClick={handleProcessImport} disabled={isProcessing || !file} className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        {isProcessing ? 'Processing...' : 'Import Data'}
      </Button>
    </div>
  );
};

export default DataImporter;
