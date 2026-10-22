/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "optim.tildacdn.one",
      },
    ],
  },
  async redirects() {
    // Endereços antigos do portal continuam funcionando após a reorganização do menu.
    const renamed = [
      ["daime-solidariedade", "o-que-e"],
      ["preciso-de-apoio", "preciso-de-ajuda"],
      ["campanhas", "doar"],
      ["voluntarios", "voluntariar"],
      ["projetos", "projetar"],
    ];
    return renamed.map(([from, to]) => ({
      source: `/:locale(pt|en)/${from}`,
      destination: `/:locale/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
