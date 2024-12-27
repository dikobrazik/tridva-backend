import hbs from 'hbs';
import {OrderStatus} from 'src/entities/enums';

hbs.registerHelper('transitionName', (currentStatus) => {
  return {
    [OrderStatus.PAID]: 'Передается в доставку',
    [OrderStatus.TO_DELIVERY]: 'Передано в доставку',
    [OrderStatus.IN_DELIVERY]: 'Доставлено',
  }[currentStatus];
});

hbs.registerHelper('on-change-group-order-status', function (groupOrder) {
  return `fetch('/admin/group-orders/change-status', {
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body: '${JSON.stringify({id: groupOrder.id, status: groupOrder.status})}',
  }).then(() => {alert('Готово!'); window.location.reload();})`;
});

hbs.registerHelper('on-change-offer-order-status', function (offerOrder) {
  return `fetch('/admin/offer-orders/change-status', {
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body: '${JSON.stringify({id: offerOrder.id, status: offerOrder.status})}',
  }).then(() => {alert('Готово!'); window.location.reload();})`;
});
