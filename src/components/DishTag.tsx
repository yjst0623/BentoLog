const colors: Record<string, string> = {
  揚げ物: '#FF8C00', 卵料理: '#DAA520', 野菜: '#4CAF50',
  肉料理: '#E53935', 魚料理: '#1565C0', その他: '#757575',
};

export default function DishTag({ name, category = 'その他', onRemove }: { name: string; category?: string; onRemove?: () => void }) {
  const color = colors[category] ?? '#757575';
  return (
    <div className="dish-tag" style={{ borderColor: color, color }} onClick={onRemove}>
      {name}{onRemove && <span className="remove">×</span>}
    </div>
  );
}
