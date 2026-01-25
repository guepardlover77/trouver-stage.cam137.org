// Déclarations pour les modules sans types

declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
  export { jsPDF };
}

declare module 'jspdf-autotable' {
  const autoTable: any;
  export default autoTable;
}

declare module 'qrcode' {
  const QRCode: {
    toDataURL(text: string, options?: any): Promise<string>;
    toCanvas(canvas: HTMLCanvasElement, text: string, options?: any): Promise<void>;
    toString(text: string, options?: any): Promise<string>;
  };
  export default QRCode;
}

declare module 'xlsx' {
  export const utils: {
    json_to_sheet(data: any[]): any;
    book_new(): any;
    book_append_sheet(workbook: any, worksheet: any, name: string): void;
    sheet_to_json(worksheet: any, options?: any): any[];
  };
  export function read(data: any, options?: any): any;
  export function writeFile(workbook: any, filename: string): void;
}

declare module 'idb-keyval' {
  export function get<T>(key: string): Promise<T | undefined>;
  export function set(key: string, value: any): Promise<void>;
  export function del(key: string): Promise<void>;
  export function clear(): Promise<void>;
  export function keys(): Promise<string[]>;
}

declare module 'chart.js' {
  export const Chart: any;
  export default Chart;
}

declare module 'leaflet.heat' {
  export {};
}

declare module 'leaflet.markercluster' {
  export {};
}

declare module 'leaflet-draw' {
  export {};
}
