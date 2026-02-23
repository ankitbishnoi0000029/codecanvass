'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ReusableSidebar,
  SidebarContentWrapper,
  SidebarOption,
} from '@/components/ui/reusable-sidebar';
import { Button } from '@/components/ui/button';
import { Download, Settings, Palette } from 'lucide-react';
import { getTableData } from '@/actions/dbAction';
import { dataType } from '@/utils/types/uiTypes';
import Meta from './meta';

import { PageTitle } from './title';

export function SqlConverter() {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedConverter, setSelectedConverter] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState('');
  const [list, setList] = useState<dataType[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = (await getTableData('sql_converters')) as dataType[];
      setList(categoriesData);
    };
    fetchData();
  }, []);

  // Get slug from URL
  useEffect(() => {
    const slug = pathname.split('/').pop() ?? '';
    setSelectedConverter(slug);
    setInputValue('');
    setOutput('');
  }, [pathname]);

  const converterOptions: SidebarOption[] =
    list?.map((item) => ({
      id: item.route ?? '', // ensure id is always a string
      label: item.urlName,
      description: item.des,
      icon: Palette,
    })) || [];

  const selectedData: dataType =
    list?.find((i) => i.route === selectedConverter) ?? ({} as dataType);

  const selectedOption = converterOptions.find((opt) => opt.id === selectedConverter);

  const footerOptions: SidebarOption[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleConverterChange = (converterId: string) => {
    router.push(`${converterId}`);
  };

  /* --------------------------
     🔥 REAL SQL PARSER
  ---------------------------*/

  const parseInsertSQL = (sql: string) => {
    const match = sql.match(/INSERT INTO\s+.+?\((.+?)\)\s+VALUES\s*\((.+?)\)/i);

    if (!match) return null;

    const columns = match[1].split(',').map((col) => col.trim().replace(/[`'"]/g, ''));

    const values = match[2].split(',').map((val) => val.trim().replace(/[`'"]/g, ''));

    const obj: any = {};
    columns.forEach((col, index) => {
      obj[col] = values[index];
    });

    return obj;
  };

  const convertSqlData = (type: string, input: string) => {
    if (!input.trim()) return 'No SQL data provided.';

    const parsed = parseInsertSQL(input);
    if (!parsed) return 'Only simple INSERT INTO statements are supported.';

    switch (type) {
      case 'sql-to-json':
        return JSON.stringify(parsed, null, 2);

      case 'sql-to-csv':
        return Object.keys(parsed).join(',') + '\n' + Object.values(parsed).join(',');

      case 'sql-to-xml':
        return `<root>\n${Object.entries(parsed)
          .map(([key, val]) => `  <${key}>${val}</${key}>`)
          .join('\n')}\n</root>`;

      case 'sql-to-yaml':
        return Object.entries(parsed)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');

      case 'sql-to-html':
        return `<table border="1">
<tr>
${Object.keys(parsed)
  .map((key) => `<th>${key}</th>`)
  .join('')}
</tr>
<tr>
${Object.values(parsed)
  .map((val) => `<td>${val}</td>`)
  .join('')}
</tr>
</table>`;

      default:
        return 'Unsupported converter.';
    }
  };

  const handleConvert = () => {
    if (!selectedConverter) return;
    const result = convertSqlData(selectedConverter, inputValue);
    setOutput(result);
  };

  const handleClear = () => {
    setInputValue('');
    setOutput('');
  };

  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ReusableSidebar
      title="SQL Converter"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={handleConverterChange}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto">
          <PageTitle selectedData={selectedData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Input SQL Data</label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="INSERT INTO users (id,name) VALUES (1,'John');"
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 w-full h-48"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Output</label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[150px] overflow-auto text-sm">
                {output ? (
                  <pre className="whitespace-pre-wrap break-all">{output}</pre>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                    <Download className="h-8 w-8 mb-2" />
                    <p>Converted results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleConvert} disabled={!selectedConverter || !inputValue.trim()}>
              Convert
            </Button>

            <Button variant="outline" onClick={handleClear} disabled={!inputValue && !output}>
              Clear
            </Button>

            <Button variant="secondary" onClick={handleDownload} disabled={!output}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {selectedData && <Meta selectedData={selectedData} />}
      </SidebarContentWrapper>
    </ReusableSidebar>
  );
}
