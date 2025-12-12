const BARBERS = [
  { id: 'b1', name: 'Парикмахер 1', price: 1200, times: ['09:00','10:00','11:00','14:00'] },
  { id: 'b2', name: 'Парикмахер 2', price: 1000, times: ['09:30','10:30','12:00','15:00'] },
  { id: 'b3', name: 'Парикмахер 3', price: 1100, times: ['10:00','11:00','13:00','16:00'] },
  { id: 'b4', name: 'Парикмахер 4', price: 1300, times: ['09:00','12:00','14:30','17:00'] },
  { id: 'b5', name: 'Парикмахер 5', price: 1250, times: ['10:15','11:45','13:30','15:30'] },
  { id: 'b6', name: 'Парикмахер 6', price: 1150, times: ['09:45','10:45','12:30','16:30'] },
];

export function getBarbers() {
  return BARBERS.slice();
}

export function getBarberById(id) {
  return BARBERS.find(b => b.id === id) || null;
}

// присваиваем объект переменной перед экспортом, чтобы убрать предупреждение eslint/import/no-anonymous-default-export
const DataAPI = { getBarbers, getBarberById };
export default DataAPI;