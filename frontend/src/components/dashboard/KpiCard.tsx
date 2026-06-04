interface Props {
  title: string;
  value: string;
  subtitle: string;
}

const KpiCard = ({
  title,
  value,
  subtitle,
}: Props) => {
  return (
    <div className="glass rounded-3xl p-6">

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

      <p className="text-green-400 mt-2">
        {subtitle}
      </p>

    </div>
  );
};

export default KpiCard;
