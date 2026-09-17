export interface BrandStyleInfo {
  name: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: string;
  ringColor: string;
  glowColor: string;
}

export function getCompetitorBrandStyle(brandName: any = '', fallbackName: any = ''): BrandStyleInfo {
  const strBrand = typeof brandName === 'string' ? brandName : brandName?.name || (typeof brandName === 'object' ? '' : String(brandName || ''));
  const strFallback = typeof fallbackName === 'string' ? fallbackName : fallbackName?.name || (typeof fallbackName === 'object' ? '' : String(fallbackName || ''));
  const combined = `${strBrand} ${strFallback}`.toLowerCase();

  if (combined.includes('buc-ee') || combined.includes('bucees')) {
    return {
      name: "Buc-ee's",
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      badgeText: 'text-amber-950 font-black',
      borderColor: 'border-amber-600',
      icon: '🦫',
      ringColor: 'ring-amber-400',
      glowColor: 'shadow-amber-500/50'
    };
  }

  if (combined.includes('quiktrip') || combined.includes('qt')) {
    return {
      name: 'QuikTrip',
      badgeBg: 'bg-gradient-to-r from-red-600 to-red-700',
      badgeText: 'text-white font-bold',
      borderColor: 'border-red-900',
      icon: '🔴',
      ringColor: 'ring-red-500',
      glowColor: 'shadow-red-600/50'
    };
  }

  if (combined.includes('wawa')) {
    return {
      name: 'Wawa',
      badgeBg: 'bg-gradient-to-r from-rose-700 to-red-600',
      badgeText: 'text-amber-200 font-bold',
      borderColor: 'border-rose-400',
      icon: '🦅',
      ringColor: 'ring-rose-400',
      glowColor: 'shadow-rose-600/50'
    };
  }

  if (combined.includes('shell')) {
    return {
      name: 'Shell',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
      badgeText: 'text-red-700 font-black',
      borderColor: 'border-red-600',
      icon: '🐚',
      ringColor: 'ring-yellow-400',
      glowColor: 'shadow-yellow-500/50'
    };
  }

  if (combined.includes('chevron') || combined.includes('texaco')) {
    return {
      name: 'Chevron',
      badgeBg: 'bg-gradient-to-r from-blue-600 to-sky-500',
      badgeText: 'text-white font-bold',
      borderColor: 'border-blue-400',
      icon: '🔷',
      ringColor: 'ring-blue-400',
      glowColor: 'shadow-blue-500/50'
    };
  }

  if (combined.includes('bp') || combined.includes('amoco')) {
    return {
      name: 'BP',
      badgeBg: 'bg-gradient-to-r from-emerald-600 to-green-500',
      badgeText: 'text-yellow-300 font-black',
      borderColor: 'border-emerald-400',
      icon: '🟢',
      ringColor: 'ring-emerald-400',
      glowColor: 'shadow-emerald-500/50'
    };
  }

  if (combined.includes('circle k') || combined.includes('couche-tard')) {
    return {
      name: 'Circle K',
      badgeBg: 'bg-gradient-to-r from-red-600 to-orange-600',
      badgeText: 'text-white font-bold',
      borderColor: 'border-orange-400',
      icon: '⭕',
      ringColor: 'ring-red-400',
      glowColor: 'shadow-red-500/50'
    };
  }

  if (combined.includes('7-eleven') || combined.includes('7 eleven') || combined.includes('speedway')) {
    return {
      name: '7-Eleven',
      badgeBg: 'bg-gradient-to-r from-emerald-700 to-teal-600',
      badgeText: 'text-orange-300 font-black',
      borderColor: 'border-orange-500',
      icon: '7️⃣',
      ringColor: 'ring-orange-400',
      glowColor: 'shadow-emerald-600/50'
    };
  }

  if (combined.includes("love's") || combined.includes('loves')) {
    return {
      name: "Love's",
      badgeBg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      badgeText: 'text-red-700 font-black',
      borderColor: 'border-red-600',
      icon: '❤️',
      ringColor: 'ring-yellow-400',
      glowColor: 'shadow-yellow-500/50'
    };
  }

  if (combined.includes('pilot') || combined.includes('flying j')) {
    return {
      name: 'Pilot Flying J',
      badgeBg: 'bg-gradient-to-r from-red-700 to-rose-800',
      badgeText: 'text-white font-bold',
      borderColor: 'border-red-400',
      icon: '✈️',
      ringColor: 'ring-red-400',
      glowColor: 'shadow-red-600/50'
    };
  }

  if (combined.includes('racetrac')) {
    return {
      name: 'RaceTrac',
      badgeBg: 'bg-gradient-to-r from-red-600 to-slate-900',
      badgeText: 'text-yellow-300 font-black',
      borderColor: 'border-red-500',
      icon: '⚡',
      ringColor: 'ring-red-500',
      glowColor: 'shadow-red-500/50'
    };
  }

  if (combined.includes('valero') || combined.includes('corner store')) {
    return {
      name: 'Valero',
      badgeBg: 'bg-gradient-to-r from-teal-700 to-cyan-600',
      badgeText: 'text-white font-bold',
      borderColor: 'border-teal-400',
      icon: '🔹',
      ringColor: 'ring-teal-400',
      glowColor: 'shadow-teal-500/50'
    };
  }

  if (combined.includes('marathon')) {
    return {
      name: 'Marathon',
      badgeBg: 'bg-gradient-to-r from-blue-700 to-indigo-700',
      badgeText: 'text-red-300 font-bold',
      borderColor: 'border-blue-400',
      icon: 'Ⓜ️',
      ringColor: 'ring-blue-400',
      glowColor: 'shadow-blue-500/50'
    };
  }

  if (combined.includes('costco') || combined.includes("sam's") || combined.includes('sams')) {
    return {
      name: combined.includes('costco') ? 'Costco Fuel' : "Sam's Club Fuel",
      badgeBg: 'bg-gradient-to-r from-blue-700 to-red-600',
      badgeText: 'text-white font-bold',
      borderColor: 'border-blue-300',
      icon: '🛒',
      ringColor: 'ring-blue-400',
      glowColor: 'shadow-blue-500/50'
    };
  }

  if (combined.includes('exxon') || combined.includes('mobil') || combined.includes('synergy')) {
    return {
      name: 'ExxonMobil',
      badgeBg: 'bg-gradient-to-r from-red-600 to-blue-700',
      badgeText: 'text-white font-black',
      borderColor: 'border-red-400',
      icon: '🔴',
      ringColor: 'ring-red-500',
      glowColor: 'shadow-red-500/50'
    };
  }

  if (combined.includes('tesla') || combined.includes('charging') || combined.includes('supercharger')) {
    return {
      name: 'EV Fast Charging',
      badgeBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      badgeText: 'text-white font-bold',
      borderColor: 'border-cyan-400',
      icon: '⚡',
      ringColor: 'ring-cyan-400',
      glowColor: 'shadow-cyan-500/50'
    };
  }

  // Default Competitor Retail Station
  return {
    name: brandName || 'Retail Station',
    badgeBg: 'bg-gradient-to-r from-slate-800 to-slate-700',
    badgeText: 'text-amber-300 font-bold',
    borderColor: 'border-slate-600',
    icon: '⛽',
    ringColor: 'ring-slate-400',
    glowColor: 'shadow-slate-700/50'
  };
}
