import { jsPDF } from 'jspdf';
import { fmt, calcMenuFinalPrice, calcEventTotal, buildShoppingList, calcCostPerPortion } from './calc.js';

export function exportEventPDF(event, menus, recipes, ingredients) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210, ml = 18, mr = 18, cw = pw - ml - mr;
  let y = 0;

  const gold = [212, 168, 83], dark = [26, 25, 22], gray = [120, 115, 108];
  const lightbg = [248, 246, 242], white = [255, 255, 255], lineGray = [225, 220, 212];

  doc.setFillColor(...gold); doc.rect(0, 0, pw, 14, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...white);
  doc.text('APP4CHEF', ml, 9.5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text('Event Quotation', ml + 32, 9.5);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const quoteNum = 'Q-' + Date.now().toString().slice(-6);
  doc.text(quoteNum + ' · ' + today, pw - mr, 9.5, { align: 'right' });
  y = 22;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(...dark);
  doc.text(event.name, ml, y); y += 7;
  doc.setDrawColor(...gold); doc.setLineWidth(0.8); doc.line(ml, y, ml + 80, y); y += 8;

  const infoRows = [
    ['Client', event.client_name, 'Date', event.event_date],
    ['Email', event.client_email, 'Guests', event.guest_count + ' guests'],
    ['Phone', event.client_phone, 'Status', event.status],
  ];
  doc.setFillColor(...lightbg); doc.roundedRect(ml, y - 3, cw, infoRows.length * 7 + 6, 2, 2, 'F');
  const col2x = ml + cw / 2 + 4;
  infoRows.forEach(([l1, v1, l2, v2]) => {
    doc.setTextColor(...gray); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(l1 + ':', ml + 4, y + 3);
    doc.setTextColor(...dark); doc.setFont('helvetica', 'bold');
    doc.text(String(v1 || '—'), ml + 24, y + 3);
    doc.setTextColor(...gray); doc.setFont('helvetica', 'normal');
    doc.text(l2 + ':', col2x, y + 3);
    doc.setTextColor(...dark); doc.setFont('helvetica', 'bold');
    doc.text(String(v2 || '—'), col2x + 22, y + 3);
    y += 7;
  });
  y += 6;

  if (event.notes) {
    doc.setFillColor(240, 236, 228); doc.roundedRect(ml, y, cw, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...gray);
    doc.text('Note: ' + event.notes, ml + 4, y + 6.5); y += 15;
  }

  (event.menus || []).forEach(em => {
    const menu = menus.find(m => m.id === em.menu_id); if (!menu) return;
    const mp = calcMenuFinalPrice(menu, recipes, ingredients);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...dark);
    doc.text('Menu: ' + menu.name, ml, y);
    if (menu.description) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...gray);
      doc.text(menu.description, ml, y + 5); y += 5;
    }
    y += 8;
    doc.setFillColor(...gold); doc.rect(ml, y, cw, 7, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...white);
    doc.text('Recipe', ml + 3, y + 5);
    doc.text('Category', ml + 70, y + 5);
    doc.text('Portions', ml + 108, y + 5);
    doc.text('Cost/portion', ml + 130, y + 5);
    doc.text('Total', ml + cw - 3, y + 5, { align: 'right' });
    y += 7;
    (menu.recipes || []).forEach((mr, ri) => {
      const rec = recipes.find(r => r.id === mr.recipe_id); if (!rec) return;
      const rowCost = calcCostPerPortion(rec, ingredients) * mr.portions;
      doc.setFillColor(ri % 2 === 0 ? 255 : 250, ri % 2 === 0 ? 255 : 248, ri % 2 === 0 ? 255 : 244);
      doc.rect(ml, y, cw, 7, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dark);
      doc.text((rec.name.length > 32 ? rec.name.slice(0, 30) + '…' : rec.name), ml + 3, y + 5);
      doc.setTextColor(...gray);
      doc.text(rec.category, ml + 70, y + 5);
      doc.text(String(mr.portions), ml + 112, y + 5);
      doc.text(fmt(calcCostPerPortion(rec, ingredients)), ml + 132, y + 5);
      doc.setTextColor(...dark); doc.setFont('helvetica', 'bold');
      doc.text(fmt(rowCost), ml + cw - 3, y + 5, { align: 'right' });
      y += 7;
    });
    y += 4;
    doc.setDrawColor(...lineGray); doc.setLineWidth(0.3);
    doc.line(ml + cw / 2, y, ml + cw, y); y += 5;
    const menuGuests = event.guest_count || 1;
    [
      ['Food cost', fmt(mp.cost)],
      [`Markup (${menu.markup}%)`, '+' + fmt(mp.selling - mp.cost)],
      [`VAT (${menu.vat}%)`, '+' + fmt(mp.vat)],
      ['Price / person', fmt(mp.final)],
      [`× ${menuGuests} guests`, ''],
    ].forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...gray);
      doc.text(lbl, ml + cw - 50, y + 3.5);
      doc.setTextColor(...dark); if (val) doc.text(val, ml + cw - 3, y + 3.5, { align: 'right' }); y += 6;
    });
    doc.setFillColor(...gold); doc.roundedRect(ml + cw - 62, y, 62, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...white);
    doc.text('Menu subtotal', ml + cw - 59, y + 6);
    doc.text(fmt(mp.final * menuGuests), ml + cw - 3, y + 6, { align: 'right' });
    y += 16;
  });

  const grand = calcEventTotal(event, menus, recipes, ingredients);
  doc.setFillColor(...dark); doc.roundedRect(ml, y, cw, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...gold);
  doc.text('TOTAL EVENT PRICE', ml + 6, y + 9.5);
  doc.setTextColor(...white); doc.text(fmt(grand), ml + cw - 6, y + 9.5, { align: 'right' });
  y += 22;
  if (event.guest_count > 0) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...gray);
    doc.text(`Price per guest: ${fmt(grand / event.guest_count)} · ${event.guest_count} guests`, ml, y); y += 12;
  }

  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...dark);
  doc.text('Shopping list', ml, y); y += 8;
  const shopping = buildShoppingList(event, menus, recipes, ingredients);
  doc.setFillColor(...gold); doc.rect(ml, y, cw, 7, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...white);
  doc.text('Ingredient', ml + 3, y + 5);
  doc.text('Quantity', ml + 90, y + 5);
  doc.text('Est. cost', ml + cw - 3, y + 5, { align: 'right' });
  y += 7;
  Object.entries(shopping).forEach(([name, data], ri) => {
    doc.setFillColor(ri % 2 === 0 ? 255 : 250, ri % 2 === 0 ? 255 : 248, ri % 2 === 0 ? 255 : 244);
    doc.rect(ml, y, cw, 7, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dark);
    doc.text(name, ml + 3, y + 5);
    doc.setTextColor(...gray);
    doc.text(`${Math.round(data.qty * 100) / 100} ${data.unit}`, ml + 90, y + 5);
    doc.setTextColor(...dark); doc.setFont('helvetica', 'bold');
    doc.text(fmt(data.cost), ml + cw - 3, y + 5, { align: 'right' });
    y += 7;
  });

  const ph = 297;
  doc.setDrawColor(...lineGray); doc.setLineWidth(0.3); doc.line(ml, ph - 16, ml + cw, ph - 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...gray);
  doc.text(`Generated by ChefCost · ${today} · ${quoteNum}`, pw / 2, ph - 10, { align: 'center' });

  doc.save(`Quote_${event.name.replace(/\s+/g, '_')}_${quoteNum}.pdf`);
}
