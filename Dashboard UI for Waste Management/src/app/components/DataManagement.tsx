import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  Download,
  Trash2,
  Upload,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { FleetDataSource } from '../hooks/useFleetDataSource';
import {
  CONTAINER_CSV_TEMPLATE,
  DEPOT_CSV_TEMPLATE,
  TRUCK_CSV_TEMPLATE,
  containersToCsv,
  depotsToCsv,
  parseContainersCsv,
  parseDepotsCsv,
  parseTrucksCsv,
  trucksToCsv,
  type CustomContainer,
  type CustomDepot,
  type CustomTruck,
} from '../lib/customFleetData';
import { downloadTextFile } from '../lib/csv';
import { WasteType } from '../lib/wasteRoutingTypes';
import { Toast } from './Toast';
import { useToast } from '../hooks/useToast';

const inputClasses =
  'w-full px-3 py-2 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground text-sm';

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Database;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function CsvActions({
  templateCsv,
  templateFilename,
  currentCsv,
  currentFilename,
  onImportText,
}: {
  templateCsv: string;
  templateFilename: string;
  currentCsv: string;
  currentFilename: string;
  onImportText: (text: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onImportText(reader.result);
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => downloadTextFile(templateFilename, templateCsv, 'text/csv')}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
      >
        <Download className="w-4 h-4" />
        قالب CSV
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
      >
        <Upload className="w-4 h-4" />
        استيراد CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => downloadTextFile(currentFilename, currentCsv, 'text/csv')}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
      >
        <Download className="w-4 h-4" />
        تصدير الحالي
      </button>
    </div>
  );
}

function ImportErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="mt-3 p-3 bg-destructive/5 border border-destructive/30 rounded-lg text-xs text-destructive space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="w-4 h-4" />
        تم تجاهل {errors.length} سطر بسبب أخطاء:
      </div>
      {errors.slice(0, 5).map((e, i) => (
        <p key={i}>{e}</p>
      ))}
      {errors.length > 5 && <p>...و{errors.length - 5} أخطاء أخرى</p>}
    </div>
  );
}

interface DataManagementProps {
  fleetDataSource: FleetDataSource;
}

export function DataManagement({ fleetDataSource }: DataManagementProps) {
  const {
    mode,
    setMode,
    depots,
    customTrucks,
    customContainers,
    setDepots,
    setCustomTrucks,
    setCustomContainers,
  } = fleetDataSource;

  const { message, showToast } = useToast();
  const [depotErrors, setDepotErrors] = useState<string[]>([]);
  const [truckErrors, setTruckErrors] = useState<string[]>([]);
  const [containerErrors, setContainerErrors] = useState<string[]>([]);

  const [depotForm, setDepotForm] = useState({ name: '', lat: '', lng: '' });
  const [truckForm, setTruckForm] = useState({
    driver: '',
    depotId: '',
    capacityL: '7000',
    avgSpeedKmh: '25',
    status: 'available' as CustomTruck['status'],
  });
  const [containerForm, setContainerForm] = useState({
    name: '',
    lat: '',
    lng: '',
    capacityL: '1100',
    fillLevel: '50',
    wasteType: 'عام' as WasteType,
    hoursSinceLastCollection: '0',
  });

  const addDepot = () => {
    const lat = Number(depotForm.lat);
    const lng = Number(depotForm.lng);
    if (!depotForm.name || Number.isNaN(lat) || Number.isNaN(lng)) {
      showToast('يرجى إدخال اسم وإحداثيات صحيحة للمستودع');
      return;
    }
    const newDepot: CustomDepot = { id: `D${depots.length + 1}-${Date.now()}`, name: depotForm.name, lat, lng };
    setDepots([...depots, newDepot]);
    setDepotForm({ name: '', lat: '', lng: '' });
    showToast('تمت إضافة المستودع');
  };

  const addTruck = () => {
    const capacityL = Number(truckForm.capacityL);
    const avgSpeedKmh = Number(truckForm.avgSpeedKmh);
    if (!truckForm.driver || !truckForm.depotId || Number.isNaN(capacityL)) {
      showToast('يرجى إدخال اسم السائق واختيار المستودع والسعة');
      return;
    }
    const newTruck: CustomTruck = {
      id: `T${String(customTrucks.length + 1).padStart(2, '0')}-${Date.now()}`,
      driver: truckForm.driver,
      depotId: truckForm.depotId,
      capacityL,
      avgSpeedKmh: Number.isNaN(avgSpeedKmh) ? 25 : avgSpeedKmh,
      status: truckForm.status,
      driverAvailable: true,
    };
    setCustomTrucks([...customTrucks, newTruck]);
    setTruckForm({ driver: '', depotId: '', capacityL: '7000', avgSpeedKmh: '25', status: 'available' });
    showToast('تمت إضافة المركبة');
  };

  const addContainer = () => {
    const lat = Number(containerForm.lat);
    const lng = Number(containerForm.lng);
    const capacityL = Number(containerForm.capacityL);
    const fillLevel = Number(containerForm.fillLevel);
    const hours = Number(containerForm.hoursSinceLastCollection);
    if (!containerForm.name || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(capacityL)) {
      showToast('يرجى إدخال اسم الحاوية وإحداثياتها وسعتها');
      return;
    }
    const newContainer: CustomContainer = {
      id: `C${String(customContainers.length + 1).padStart(3, '0')}-${Date.now()}`,
      name: containerForm.name,
      lat,
      lng,
      capacityL,
      fillLevel: Number.isNaN(fillLevel) ? 0 : Math.min(100, Math.max(0, fillLevel)),
      wasteType: containerForm.wasteType,
      hoursSinceLastCollection: Number.isNaN(hours) ? 0 : hours,
    };
    setCustomContainers([...customContainers, newContainer]);
    setContainerForm({
      name: '',
      lat: '',
      lng: '',
      capacityL: '1100',
      fillLevel: '50',
      wasteType: 'عام',
      hoursSinceLastCollection: '0',
    });
    showToast('تمت إضافة الحاوية');
  };

  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Toast message={message} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة بيانات النظام</h1>
          <p className="text-muted-foreground">
            أدخل أو استورد المستودعات والمركبات والحاويات الفعلية لبلديتك، بدلاً من البيانات التجريبية
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">مصدر البيانات</h3>
              <p className="text-sm text-muted-foreground">حدد ما إذا كان النظام يعمل على بيانات تجريبية أو بياناتك الفعلية</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('demo')}
              className={`flex-1 p-4 rounded-lg border-2 text-right transition-colors ${
                mode === 'demo' ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
              }`}
            >
              <p className="font-semibold text-foreground">بيانات تجريبية</p>
              <p className="text-xs text-muted-foreground mt-1">أسطول ومناطق وهمية لتجربة النظام وعرضه</p>
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 p-4 rounded-lg border-2 text-right transition-colors ${
                mode === 'custom' ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
              }`}
            >
              <p className="font-semibold text-foreground">بياناتي الفعلية</p>
              <p className="text-xs text-muted-foreground mt-1">
                المستودعات والمركبات والحاويات المُدخلة أدناه ({depots.length} مستودع، {customTrucks.length} مركبة،{' '}
                {customContainers.length} حاوية)
              </p>
            </button>
          </div>

          {mode === 'custom' && depots.length === 0 && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg text-sm text-warning">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              أضف مستودعاً واحداً على الأقل قبل إضافة المركبات - كل مركبة يجب أن تنطلق من مستودع فعلي.
            </div>
          )}
        </motion.div>

        {/* Depots */}
        <SectionCard title="المستودعات" description="نقاط انطلاق وعودة المركبات" icon={Database}>
          <div className="space-y-4">
            <CsvActions
              templateCsv={DEPOT_CSV_TEMPLATE}
              templateFilename="قالب-المستودعات.csv"
              currentCsv={depotsToCsv(depots)}
              currentFilename="المستودعات.csv"
              onImportText={(text) => {
                const { items, errors } = parseDepotsCsv(text);
                setDepots([...depots, ...items]);
                setDepotErrors(errors);
                if (items.length > 0) showToast(`تم استيراد ${items.length} مستودع`);
              }}
            />
            <ImportErrors errors={depotErrors} />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                className={inputClasses}
                placeholder="اسم المستودع"
                value={depotForm.name}
                onChange={(e) => setDepotForm({ ...depotForm, name: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="خط العرض (lat)"
                value={depotForm.lat}
                onChange={(e) => setDepotForm({ ...depotForm, lat: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="خط الطول (lng)"
                value={depotForm.lng}
                onChange={(e) => setDepotForm({ ...depotForm, lng: e.target.value })}
              />
              <button
                onClick={addDepot}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            {depots.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-right p-2">الاسم</th>
                      <th className="text-right p-2">الإحداثيات</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {depots.map((d) => (
                      <tr key={d.id} className="border-b border-border/50">
                        <td className="p-2 text-foreground">{d.name}</td>
                        <td className="p-2 text-muted-foreground">
                          {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                        </td>
                        <td className="p-2 text-left">
                          <button
                            onClick={() => setDepots(depots.filter((x) => x.id !== d.id))}
                            className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Trucks */}
        <SectionCard title="المركبات" description="أسطول الجمع الفعلي وسائقوه" icon={Database}>
          <div className="space-y-4">
            <CsvActions
              templateCsv={TRUCK_CSV_TEMPLATE}
              templateFilename="قالب-المركبات.csv"
              currentCsv={trucksToCsv(customTrucks)}
              currentFilename="المركبات.csv"
              onImportText={(text) => {
                const { items, errors } = parseTrucksCsv(text, depots);
                setCustomTrucks([...customTrucks, ...items]);
                setTruckErrors(errors);
                if (items.length > 0) showToast(`تم استيراد ${items.length} مركبة`);
              }}
            />
            <ImportErrors errors={truckErrors} />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                className={inputClasses}
                placeholder="اسم السائق"
                value={truckForm.driver}
                onChange={(e) => setTruckForm({ ...truckForm, driver: e.target.value })}
              />
              <select
                className={inputClasses}
                value={truckForm.depotId}
                onChange={(e) => setTruckForm({ ...truckForm, depotId: e.target.value })}
              >
                <option value="">-- المستودع --</option>
                {depots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input
                className={inputClasses}
                placeholder="السعة (لتر)"
                value={truckForm.capacityL}
                onChange={(e) => setTruckForm({ ...truckForm, capacityL: e.target.value })}
              />
              <select
                className={inputClasses}
                value={truckForm.status}
                onChange={(e) => setTruckForm({ ...truckForm, status: e.target.value as CustomTruck['status'] })}
              >
                <option value="available">متاحة</option>
                <option value="maintenance">صيانة</option>
              </select>
              <button
                onClick={addTruck}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            {customTrucks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-right p-2">السائق</th>
                      <th className="text-right p-2">المستودع</th>
                      <th className="text-right p-2">السعة</th>
                      <th className="text-right p-2">الحالة</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customTrucks.map((t) => (
                      <tr key={t.id} className="border-b border-border/50">
                        <td className="p-2 text-foreground">{t.driver}</td>
                        <td className="p-2 text-muted-foreground">
                          {depots.find((d) => d.id === t.depotId)?.name ?? t.depotId}
                        </td>
                        <td className="p-2 text-muted-foreground">{t.capacityL} ل</td>
                        <td className="p-2 text-muted-foreground">
                          {t.status === 'available' ? 'متاحة' : 'صيانة'}
                        </td>
                        <td className="p-2 text-left">
                          <button
                            onClick={() => setCustomTrucks(customTrucks.filter((x) => x.id !== t.id))}
                            className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Containers */}
        <SectionCard title="الحاويات" description="حاويات جمع النفايات ومواقعها الفعلية" icon={Database}>
          <div className="space-y-4">
            <CsvActions
              templateCsv={CONTAINER_CSV_TEMPLATE}
              templateFilename="قالب-الحاويات.csv"
              currentCsv={containersToCsv(customContainers)}
              currentFilename="الحاويات.csv"
              onImportText={(text) => {
                const { items, errors } = parseContainersCsv(text);
                setCustomContainers([...customContainers, ...items]);
                setContainerErrors(errors);
                if (items.length > 0) showToast(`تم استيراد ${items.length} حاوية`);
              }}
            />
            <ImportErrors errors={containerErrors} />
            <p className="text-xs text-muted-foreground">
              للأعداد الكبيرة (عشرات أو مئات الحاويات) استخدم استيراد CSV بدلاً من الإدخال اليدوي.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
              <input
                className={inputClasses}
                placeholder="اسم/رمز الحاوية"
                value={containerForm.name}
                onChange={(e) => setContainerForm({ ...containerForm, name: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="lat"
                value={containerForm.lat}
                onChange={(e) => setContainerForm({ ...containerForm, lat: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="lng"
                value={containerForm.lng}
                onChange={(e) => setContainerForm({ ...containerForm, lng: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="السعة (لتر)"
                value={containerForm.capacityL}
                onChange={(e) => setContainerForm({ ...containerForm, capacityL: e.target.value })}
              />
              <input
                className={inputClasses}
                placeholder="نسبة الامتلاء %"
                value={containerForm.fillLevel}
                onChange={(e) => setContainerForm({ ...containerForm, fillLevel: e.target.value })}
              />
              <button
                onClick={addContainer}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>

            {customContainers.length > 0 && (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-right p-2">الاسم</th>
                      <th className="text-right p-2">الإحداثيات</th>
                      <th className="text-right p-2">الامتلاء</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customContainers.map((c) => (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="p-2 text-foreground">{c.name}</td>
                        <td className="p-2 text-muted-foreground">
                          {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                        </td>
                        <td className="p-2 text-muted-foreground">{c.fillLevel}%</td>
                        <td className="p-2 text-left">
                          <button
                            onClick={() => setCustomContainers(customContainers.filter((x) => x.id !== c.id))}
                            className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="flex items-start gap-3 p-4 bg-success/5 border-2 border-success/20 rounded-xl text-sm text-success">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            جميع البيانات هنا محفوظة في متصفحك (localStorage) وتبقى بعد إعادة التحميل. للاستخدام الفعلي متعدد
            المستخدمين، يلزم ربط النظام بقاعدة بيانات وخادم حقيقيين - راجع خارطة الطريق في وثيقة المشروع.
          </p>
        </div>
      </div>
    </div>
  );
}
