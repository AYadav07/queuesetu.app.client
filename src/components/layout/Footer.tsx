import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Careers"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium text-slate-700">
                {column.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500">© 2026 QueueSetu</p>
      </div>
    </footer>
  );
}
