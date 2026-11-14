
export const rollbackSaleStock = async (client, sale_id) => {
  const items = await client.query('SELECT * FROM sale_items WHERE sale_id = $1', [sale_id]);
  for (const item of items.rows) {
    await client.query(
      'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
      [item.quantity, item.product_id]
    );
  }
};

export const rollbackStockTransaction = async (client, transaction_id) => {
  const txn = await client.query('SELECT * FROM stock_transactions WHERE id = $1', [transaction_id]);
  if (!txn.rows.length) throw new Error('Transaction not found');
  const { product_id, transaction_type, quantity } = txn.rows[0];
  const direction = transaction_type === 'stock_in' ? -1 : 1;
  await client.query(
    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
    [direction * quantity, product_id]
  );
  await client.query('DELETE FROM stock_transactions WHERE id = $1', [transaction_id]);
};
