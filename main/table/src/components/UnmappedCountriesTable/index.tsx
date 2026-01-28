import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box as MuiBox,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// Country code to flag image URL mapping (same as in ChoroplethMap)
const countryFlagMap: { [key: string]: string } = {
  'United States of America': 'https://flagcdn.com/w20/us.png',
  'United States': 'https://flagcdn.com/w20/us.png',
  'USA': 'https://flagcdn.com/w20/us.png',
  'US': 'https://flagcdn.com/w20/us.png',
  'United Kingdom': 'https://flagcdn.com/w20/gb.png',
  'UK': 'https://flagcdn.com/w20/gb.png',
  'Canada': 'https://flagcdn.com/w20/ca.png',
  'Australia': 'https://flagcdn.com/w20/au.png',
  'Germany': 'https://flagcdn.com/w20/de.png',
  'France': 'https://flagcdn.com/w20/fr.png',
  'Italy': 'https://flagcdn.com/w20/it.png',
  'Spain': 'https://flagcdn.com/w20/es.png',
  'Japan': 'https://flagcdn.com/w20/jp.png',
  'China': 'https://flagcdn.com/w20/cn.png',
  'India': 'https://flagcdn.com/w20/in.png',
  'Brazil': 'https://flagcdn.com/w20/br.png',
  'Mexico': 'https://flagcdn.com/w20/mx.png',
  'South Korea': 'https://flagcdn.com/w20/kr.png',
  'Russia': 'https://flagcdn.com/w20/ru.png',
  'Argentina': 'https://flagcdn.com/w20/ar.png',
  'South Africa': 'https://flagcdn.com/w20/za.png',
  'Egypt': 'https://flagcdn.com/w20/eg.png',
  'Nigeria': 'https://flagcdn.com/w20/ng.png',
  'Kenya': 'https://flagcdn.com/w20/ke.png',
  'Turkey': 'https://flagcdn.com/w20/tr.png',
  'Saudi Arabia': 'https://flagcdn.com/w20/sa.png',
  'Indonesia': 'https://flagcdn.com/w20/id.png',
  'Thailand': 'https://flagcdn.com/w20/th.png',
  'Vietnam': 'https://flagcdn.com/w20/vn.png',
  'Philippines': 'https://flagcdn.com/w20/ph.png',
  'Malaysia': 'https://flagcdn.com/w20/my.png',
  'Singapore': 'https://flagcdn.com/w20/sg.png',
  'Pakistan': 'https://flagcdn.com/w20/pk.png',
  'Bangladesh': 'https://flagcdn.com/w20/bd.png',
  'Iran': 'https://flagcdn.com/w20/ir.png',
  'Iraq': 'https://flagcdn.com/w20/iq.png',
  'Israel': 'https://flagcdn.com/w20/il.png',
  'UAE': 'https://flagcdn.com/w20/ae.png',
  'United Arab Emirates': 'https://flagcdn.com/w20/ae.png',
  'Oman': 'https://flagcdn.com/w20/om.png',
  'Poland': 'https://flagcdn.com/w20/pl.png',
  'Netherlands': 'https://flagcdn.com/w20/nl.png',
  'Belgium': 'https://flagcdn.com/w20/be.png',
  'Switzerland': 'https://flagcdn.com/w20/ch.png',
  'Sweden': 'https://flagcdn.com/w20/se.png',
  'Norway': 'https://flagcdn.com/w20/no.png',
  'Denmark': 'https://flagcdn.com/w20/dk.png',
  'Finland': 'https://flagcdn.com/w20/fi.png',
  'Austria': 'https://flagcdn.com/w20/at.png',
  'Greece': 'https://flagcdn.com/w20/gr.png',
  'Portugal': 'https://flagcdn.com/w20/pt.png',
  'Ireland': 'https://flagcdn.com/w20/ie.png',
  'Czech Republic': 'https://flagcdn.com/w20/cz.png',
  'Czechia': 'https://flagcdn.com/w20/cz.png',
  'Hungary': 'https://flagcdn.com/w20/hu.png',
  'Romania': 'https://flagcdn.com/w20/ro.png',
  'Bulgaria': 'https://flagcdn.com/w20/bg.png',
  'Croatia': 'https://flagcdn.com/w20/hr.png',
  'Slovakia': 'https://flagcdn.com/w20/sk.png',
  'Slovenia': 'https://flagcdn.com/w20/si.png',
  'Estonia': 'https://flagcdn.com/w20/ee.png',
  'Latvia': 'https://flagcdn.com/w20/lv.png',
  'Lithuania': 'https://flagcdn.com/w20/lt.png',
  'Luxembourg': 'https://flagcdn.com/w20/lu.png',
  'Malta': 'https://flagcdn.com/w20/mt.png',
  'Cyprus': 'https://flagcdn.com/w20/cy.png',
  'Chile': 'https://flagcdn.com/w20/cl.png',
  'Peru': 'https://flagcdn.com/w20/pe.png',
  'Colombia': 'https://flagcdn.com/w20/co.png',
  'Venezuela': 'https://flagcdn.com/w20/ve.png',
  'Ecuador': 'https://flagcdn.com/w20/ec.png',
  'Bolivia': 'https://flagcdn.com/w20/bo.png',
  'Uruguay': 'https://flagcdn.com/w20/uy.png',
  'Paraguay': 'https://flagcdn.com/w20/py.png',
  'Costa Rica': 'https://flagcdn.com/w20/cr.png',
  'Panama': 'https://flagcdn.com/w20/pa.png',
  'Guatemala': 'https://flagcdn.com/w20/gt.png',
  'Cuba': 'https://flagcdn.com/w20/cu.png',
  'Jamaica': 'https://flagcdn.com/w20/jm.png',
  'Trinidad and Tobago': 'https://flagcdn.com/w20/tt.png',
  'Barbados': 'https://flagcdn.com/w20/bb.png',
  'Bahamas': 'https://flagcdn.com/w20/bs.png',
  'New Zealand': 'https://flagcdn.com/w20/nz.png',
  'Fiji': 'https://flagcdn.com/w20/fj.png',
  'Papua New Guinea': 'https://flagcdn.com/w20/pg.png',
  'Sri Lanka': 'https://flagcdn.com/w20/lk.png',
  'Myanmar': 'https://flagcdn.com/w20/mm.png',
  'Cambodia': 'https://flagcdn.com/w20/kh.png',
  'Laos': 'https://flagcdn.com/w20/la.png',
  'Mongolia': 'https://flagcdn.com/w20/mn.png',
  'Nepal': 'https://flagcdn.com/w20/np.png',
  'Bhutan': 'https://flagcdn.com/w20/bt.png',
  'Afghanistan': 'https://flagcdn.com/w20/af.png',
  'Morocco': 'https://flagcdn.com/w20/ma.png',
  'Tunisia': 'https://flagcdn.com/w20/tn.png',
  'Libya': 'https://flagcdn.com/w20/ly.png',
  'Algeria': 'https://flagcdn.com/w20/dz.png',
  'Sudan': 'https://flagcdn.com/w20/sd.png',
  'Ethiopia': 'https://flagcdn.com/w20/et.png',
  'Ghana': 'https://flagcdn.com/w20/gh.png',
  'Ivory Coast': 'https://flagcdn.com/w20/ci.png',
  'Senegal': 'https://flagcdn.com/w20/sn.png',
  'Mali': 'https://flagcdn.com/w20/ml.png',
  'Burkina Faso': 'https://flagcdn.com/w20/bf.png',
  'Niger': 'https://flagcdn.com/w20/ne.png',
  'Chad': 'https://flagcdn.com/w20/td.png',
  'Cameroon': 'https://flagcdn.com/w20/cm.png',
  'Congo': 'https://flagcdn.com/w20/cg.png',
  'Dem. Rep. Congo': 'https://flagcdn.com/w20/cd.png',
  'Uganda': 'https://flagcdn.com/w20/ug.png',
  'Tanzania': 'https://flagcdn.com/w20/tz.png',
  'Rwanda': 'https://flagcdn.com/w20/rw.png',
  'Burundi': 'https://flagcdn.com/w20/bi.png',
  'Madagascar': 'https://flagcdn.com/w20/mg.png',
  'Mozambique': 'https://flagcdn.com/w20/mz.png',
  'Zambia': 'https://flagcdn.com/w20/zm.png',
  'Zimbabwe': 'https://flagcdn.com/w20/zw.png',
  'Botswana': 'https://flagcdn.com/w20/bw.png',
  'Namibia': 'https://flagcdn.com/w20/na.png',
  'Angola': 'https://flagcdn.com/w20/ao.png',
  'Gabon': 'https://flagcdn.com/w20/ga.png',
  'Equatorial Guinea': 'https://flagcdn.com/w20/gq.png',
  'Central African Rep.': 'https://flagcdn.com/w20/cf.png',
  'Central African Republic': 'https://flagcdn.com/w20/cf.png',
  'South Sudan': 'https://flagcdn.com/w20/ss.png',
  'Eritrea': 'https://flagcdn.com/w20/er.png',
  'Djibouti': 'https://flagcdn.com/w20/dj.png',
  'Somalia': 'https://flagcdn.com/w20/so.png',
  'Liberia': 'https://flagcdn.com/w20/lr.png',
  'Sierra Leone': 'https://flagcdn.com/w20/sl.png',
  'Guinea': 'https://flagcdn.com/w20/gn.png',
  'Guinea-Bissau': 'https://flagcdn.com/w20/gw.png',
  'Gambia': 'https://flagcdn.com/w20/gm.png',
  'Cape Verde': 'https://flagcdn.com/w20/cv.png',
  'Sao Tome and Principe': 'https://flagcdn.com/w20/st.png',
  'Comoros': 'https://flagcdn.com/w20/km.png',
  'Seychelles': 'https://flagcdn.com/w20/sc.png',
  'Mauritius': 'https://flagcdn.com/w20/mu.png',
  'Maldives': 'https://flagcdn.com/w20/mv.png',
  'Samoa': 'https://flagcdn.com/w20/ws.png',
  'Tonga': 'https://flagcdn.com/w20/to.png',
  'Vanuatu': 'https://flagcdn.com/w20/vu.png',
  'Solomon Is.': 'https://flagcdn.com/w20/sb.png',
  'Kiribati': 'https://flagcdn.com/w20/ki.png',
  'Marshall Islands': 'https://flagcdn.com/w20/mh.png',
  'Palau': 'https://flagcdn.com/w20/pw.png',
  'Nauru': 'https://flagcdn.com/w20/nr.png',
  'Tuvalu': 'https://flagcdn.com/w20/tv.png',
  'Micronesia': 'https://flagcdn.com/w20/fm.png',
  'eSwatini': 'https://flagcdn.com/w20/sz.png',
  'Eswatini': 'https://flagcdn.com/w20/sz.png',
  'Lesotho': 'https://flagcdn.com/w20/ls.png',
  'Benin': 'https://flagcdn.com/w20/bj.png',
  'Togo': 'https://flagcdn.com/w20/tg.png',
  'Guyana': 'https://flagcdn.com/w20/gy.png',
  'Suriname': 'https://flagcdn.com/w20/sr.png',
  'French Guiana': 'https://flagcdn.com/w20/gf.png',
  'Belize': 'https://flagcdn.com/w20/bz.png',
  'Honduras': 'https://flagcdn.com/w20/hn.png',
  'Nicaragua': 'https://flagcdn.com/w20/ni.png',
  'Haiti': 'https://flagcdn.com/w20/ht.png',
  'Dominican Rep.': 'https://flagcdn.com/w20/do.png',
  'Monaco': 'https://flagcdn.com/w20/mc.png',
  'San Marino': 'https://flagcdn.com/w20/sm.png',
  'Vatican City': 'https://flagcdn.com/w20/va.png',
  'Andorra': 'https://flagcdn.com/w20/ad.png',
  'Liechtenstein': 'https://flagcdn.com/w20/li.png',
  'Iceland': 'https://flagcdn.com/w20/is.png',
  'Greenland': 'https://flagcdn.com/w20/gl.png',
  'Faroe Islands': 'https://flagcdn.com/w20/fo.png',
  'Isle of Man': 'https://flagcdn.com/w20/im.png',
  'Jersey': 'https://flagcdn.com/w20/je.png',
  'Guernsey': 'https://flagcdn.com/w20/gg.png',
  'Gibraltar': 'https://flagcdn.com/w20/gi.png',
  'Bermuda': 'https://flagcdn.com/w20/bm.png',
  'Cayman Islands': 'https://flagcdn.com/w20/ky.png',
  'British Virgin Islands': 'https://flagcdn.com/w20/vg.png',
  'U.S. Virgin Islands': 'https://flagcdn.com/w20/vi.png',
  'Turks and Caicos Islands': 'https://flagcdn.com/w20/tc.png',
  'Puerto Rico': 'https://flagcdn.com/w20/pr.png',
  'Aruba': 'https://flagcdn.com/w20/aw.png',
  'Curacao': 'https://flagcdn.com/w20/cw.png',
  'French Polynesia': 'https://flagcdn.com/w20/pf.png',
  'New Caledonia': 'https://flagcdn.com/w20/nc.png',
  'Martinique': 'https://flagcdn.com/w20/mq.png',
  'Guadeloupe': 'https://flagcdn.com/w20/gp.png',
  'Reunion': 'https://flagcdn.com/w20/re.png',
  'Mayotte': 'https://flagcdn.com/w20/yt.png',
  'Saint Barthelemy': 'https://flagcdn.com/w20/bl.png',
  'Saint Martin': 'https://flagcdn.com/w20/mf.png',
  'Saint Pierre and Miquelon': 'https://flagcdn.com/w20/pm.png',
  'Wallis and Futuna': 'https://flagcdn.com/w20/wf.png',
  'Saint Helena': 'https://flagcdn.com/w20/sh.png',
  'Montserrat': 'https://flagcdn.com/w20/ms.png',
  'Anguilla': 'https://flagcdn.com/w20/ai.png',
  'British Indian Ocean Territory': 'https://flagcdn.com/w20/io.png',
  'South Georgia': 'https://flagcdn.com/w20/gs.png',
  'Pitcairn Islands': 'https://flagcdn.com/w20/pn.png',
  'Tokelau': 'https://flagcdn.com/w20/tk.png',
  'Cook Islands': 'https://flagcdn.com/w20/ck.png',
  'Niue': 'https://flagcdn.com/w20/nu.png',
  'American Samoa': 'https://flagcdn.com/w20/as.png',
  'Northern Mariana Islands': 'https://flagcdn.com/w20/mp.png',
  'Guam': 'https://flagcdn.com/w20/gu.png',
  'Hong Kong': 'https://flagcdn.com/w20/hk.png',
  'Macau': 'https://flagcdn.com/w20/mo.png',
  'Taiwan': 'https://flagcdn.com/w20/tw.png',
  'Palestine': 'https://flagcdn.com/w20/ps.png',
  'Western Sahara': 'https://flagcdn.com/w20/eh.png',
  'Kosovo': 'https://flagcdn.com/w20/xk.png',
  'North Macedonia': 'https://flagcdn.com/w20/mk.png',
  'Macedonia': 'https://flagcdn.com/w20/mk.png',
  'Serbia': 'https://flagcdn.com/w20/rs.png',
  'Montenegro': 'https://flagcdn.com/w20/me.png',
  'Bosnia and Herzegovina': 'https://flagcdn.com/w20/ba.png',
  'Albania': 'https://flagcdn.com/w20/al.png',
  'Moldova': 'https://flagcdn.com/w20/md.png',
  'Belarus': 'https://flagcdn.com/w20/by.png',
  'Ukraine': 'https://flagcdn.com/w20/ua.png',
  'Georgia': 'https://flagcdn.com/w20/ge.png',
  'Armenia': 'https://flagcdn.com/w20/am.png',
  'Azerbaijan': 'https://flagcdn.com/w20/az.png',
  'Kazakhstan': 'https://flagcdn.com/w20/kz.png',
  'Uzbekistan': 'https://flagcdn.com/w20/uz.png',
  'Turkmenistan': 'https://flagcdn.com/w20/tm.png',
  'Kyrgyzstan': 'https://flagcdn.com/w20/kg.png',
  'Tajikistan': 'https://flagcdn.com/w20/tj.png',
  'Brunei': 'https://flagcdn.com/w20/bn.png',
  'East Timor': 'https://flagcdn.com/w20/tl.png',
  'Timor-Leste': 'https://flagcdn.com/w20/tl.png',
  'Dominica': 'https://flagcdn.com/w20/dm.png',
  'Malawi': 'https://flagcdn.com/w20/mw.png',
  'Mauritania': 'https://flagcdn.com/w20/mr.png',
  'Democratic Republic of the Congo': 'https://flagcdn.com/w20/cd.png'
};

// Function to get color based on value (similar to map's color scale)
const getColorForValue = (value: number, maxValue: number) => {
  // Using a blue color scale similar to the map
  const intensity = Math.min(1, value / maxValue);
  const hue = 210; // Blue hue
  const saturation = 70;
  const lightness = 90 - (intensity * 40); // Lighter for lower values
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

interface CountryData {
  country: string;
  value: number;
  count: number;
}

interface UnmappedCountriesTableProps {
  data: CountryData[];
}

const UnmappedCountriesTable: React.FC<UnmappedCountriesTableProps> = ({ data }) => {
  const theme = useTheme();
  const [worldAtlasCountries, setWorldAtlasCountries] = useState<Set<string>>(new Set());
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Load world atlas countries to compare against dataset
  useEffect(() => {
    const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    fetch(geoUrl)
      .then(res => res.json())
      .then(geoData => {
        const countries = new Set<string>(
          geoData.objects.countries.geographies.map((geo: any) => geo.properties.name as string)
        );
        setWorldAtlasCountries(countries);
      })
      .catch(err => console.error('Error loading world atlas countries:', err));
  }, []);
  
  // Filter data to find countries not in world atlas
  const unmappedData = useMemo(() => {
    // If world atlas countries haven't loaded yet, show all data as unmapped temporarily
    if (worldAtlasCountries.size === 0) {
      console.log('World atlas countries not loaded yet, showing all data as unmapped temporarily');
      return data.sort((a, b) => b.value - a.value);
    }
    
    const filtered = data.filter(item => {
      const countryName = item.country;
      const isUnmapped = !worldAtlasCountries.has(countryName) || 
                        countryName === 'Hong Kong' || 
                        countryName === 'Macau';
      return isUnmapped;
    }).sort((a, b) => b.value - a.value);
    
    console.log('World atlas countries loaded:', worldAtlasCountries.size);
    console.log('Total countries in data:', data.length);
    console.log('Unmapped countries found:', filtered.length);
    
    return filtered;
  }, [data, worldAtlasCountries]);

  // Find max value for color scaling
  const maxValue = unmappedData.length > 0 ? unmappedData[0].value : 1;

  const handleCountryHover = (item: CountryData, event: React.MouseEvent) => {
    const flagUrl = countryFlagMap[item.country];
    const tooltipText = flagUrl 
      ? `<img src="${flagUrl}" alt="${item.country}" style="width: 20px; height: 15px; margin-right: 8px; vertical-align: middle;" /> ${item.country}: ${item.value.toLocaleString()} companies`
      : `${item.country}: ${item.value.toLocaleString()} companies`;
    setTooltipContent(tooltipText);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleCountryLeave = () => {
    setTooltipContent('');
  };

  if (unmappedData.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 2, position: 'relative' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 560, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '150px' }}>Country/Region</TableCell>
              <TableCell sx={{ width: '100px', fontWeight: 'bold', textAlign: 'center' }}>Distribution</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Companies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unmappedData.map((item) => {
              const color = getColorForValue(item.value, maxValue);
              
              return (
                <TableRow key={item.country} hover>
                  <TableCell 
                    sx={{ textAlign: 'center', cursor: 'pointer' }}
                    onMouseEnter={(event) => handleCountryHover(item, event)}
                    onMouseMove={(event) => setMousePosition({ x: event.clientX, y: event.clientY })}
                    onMouseLeave={handleCountryLeave}
                  >
                    {item.country}
                  </TableCell>
                  <TableCell align="center" sx={{ width: '40px' }}>
                    <MuiBox 
                      sx={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color,
                        borderRadius: '4px',
                        margin: '0 auto'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {item.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {tooltipContent && (
        <Box
          sx={{
            position: 'fixed',
            top: mousePosition.y - 40,
            left: mousePosition.x + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-50%, 0)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </Box>
  );
};

export default UnmappedCountriesTable;
