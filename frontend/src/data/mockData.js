export const properties = [
  { id:'p1', title:'Willow Creek Residency', location:'Vesu, Surat', rent:18500, bhk:'2 BHK', bhkNum:2, area:'1050 sq.ft', furnishing:'Semi-Furnished', type:'Apartment', availability:'Available Now', amenities:['Parking','Lift','Power Backup','Gym'], image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop'], deposit:55500, availableFrom:'15 Oct 2026', description:"A bright, well-ventilated 2 BHK in a gated community close to Vesu's main commercial stretch. Recently repainted with modular kitchen fittings and a dedicated covered parking slot.", landlord:'Rakesh Patel', favorite:true },
  { id:'p2', title:'Palm Grove Apartments', location:'Adajan, Surat', rent:14000, bhk:'1 BHK', bhkNum:1, area:'650 sq.ft', furnishing:'Furnished', type:'Apartment', availability:'Available from 1 Nov', amenities:['Lift','Security','Water Supply'], image:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop'], deposit:28000, availableFrom:'1 Nov 2026', description:'Compact, fully-furnished 1 BHK ideal for young professionals. Walking distance to cafes and the riverfront promenade.', landlord:'Kunal Desai', favorite:false },
  { id:'p3', title:'Cedar Heights', location:'Pal, Surat', rent:26000, bhk:'3 BHK', bhkNum:3, area:'1450 sq.ft', furnishing:'Unfurnished', type:'Villa', availability:'Available Now', amenities:['Garden','Parking','Power Backup','Club House'], image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop'], deposit:78000, availableFrom:'Immediate', description:'Spacious independent villa with a private garden, ideal for families. Located in a quiet residential pocket with easy access to schools.', landlord:'Meera Shah', favorite:false },
  { id:'p4', title:'Riverside Elm Towers', location:'Athwa, Surat', rent:21000, bhk:'2 BHK', bhkNum:2, area:'1120 sq.ft', furnishing:'Semi-Furnished', type:'Apartment', availability:'Available Now', amenities:['Lift','Gym','Swimming Pool','Parking'], image:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop'], deposit:63000, availableFrom:'Immediate', description:'High-rise 2 BHK with river-facing balcony, premium fittings, and access to a residents-only pool and gym.', landlord:'Nisha Kapoor', favorite:true },
  { id:'p5', title:'Sunview Homes', location:'Vesu, Surat', rent:16500, bhk:'2 BHK', bhkNum:2, area:'980 sq.ft', furnishing:'Unfurnished', type:'Apartment', availability:'Available Now', amenities:['Lift','Parking'], image:'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop'], deposit:49500, availableFrom:'Immediate', description:'A no-frills, budget-friendly 2 BHK with good natural light and a quiet neighborhood feel.', landlord:'Sanjay Mehta', favorite:false },
  { id:'p6', title:'Oakridge Villas', location:'Pal, Surat', rent:32000, bhk:'4 BHK', bhkNum:4, area:'1900 sq.ft', furnishing:'Furnished', type:'Villa', availability:'Available from 20 Sep', amenities:['Garden','Parking','Club House','Power Backup','Gym'], image:'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=900&auto=format&fit=crop', gallery:['https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop'], deposit:96000, availableFrom:'20 Sep 2026', description:'A premium furnished villa with a landscaped garden and dedicated club house access, perfect for larger families.', landlord:'Priya Nair', favorite:false },
];

export const rentalRequests = [
  { id:'r1', propertyId:'p1', property:'Willow Creek Residency', location:'Vesu, Surat', landlord:'Rakesh Patel', requestedDate:'28 Aug 2026', listedRent:18500, status:'Pending' },
  { id:'r2', propertyId:'p3', property:'Cedar Heights', location:'Pal, Surat', landlord:'Meera Shah', requestedDate:'20 Aug 2026', listedRent:26000, status:'Accepted' },
  { id:'r3', propertyId:'p2', property:'Palm Grove Apartments', location:'Adajan, Surat', landlord:'Kunal Desai', requestedDate:'12 Aug 2026', listedRent:14000, status:'Rejected' },
];

export const myRentals = [
  { id:'rent1', propertyId:'p3', property:'Cedar Heights', address:'14 Pal Society, Pal, Surat, Gujarat', landlord:'Meera Shah', startDate:'1 Sep 2026', contractualRent:25500, deposit:76500, agreementStatus:'Signed', image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop' },
];

export const agreementsData = [
  { id:'a1', name:'Cedar Heights - Lease Agreement.pdf', property:'Cedar Heights', linked:true, uploadDate:'2 Sep 2026', status:'Active', analysisStatus:'Completed', riskLevel:'Medium' },
  { id:'a2', name:'Old Flat Agreement - Adajan.pdf', property:'Independent upload (no linked property)', linked:false, uploadDate:'14 Jun 2026', status:'Expired', analysisStatus:'Completed', riskLevel:'High' },
  { id:'a3', name:'Draft Agreement - Vesu 2BHK.docx', property:'Willow Creek Residency', linked:false, uploadDate:'29 Aug 2026', status:'Draft', analysisStatus:'Processing', riskLevel:null },
];

export const financialTerms = [
  { label:'Monthly Rent', value:'₹25,500' },
  { label:'Security Deposit', value:'₹76,500 (3x rent)' },
  { label:'Maintenance', value:'₹1,200/mo' },
  { label:'Late Fee', value:'₹150/day after 5th' },
  { label:'Other Charges', value:'₹2,000 move-in fee' },
];
export const leaseDetails = [
  { label:'Start Date', value:'1 Sep 2026' },
  { label:'End Date', value:'31 Aug 2027' },
  { label:'Lock-in Period', value:'6 months' },
  { label:'Notice Period', value:'60 days' },
  { label:'Renewal Terms', value:'Auto-renews' },
];
export const importantClauses = [
  { title:'Termination', detail:"Either party may terminate with 60 days' written notice after the lock-in period ends." },
  { title:'Security Deposit', detail:'Deposit is refundable within 30 days of move-out, minus deductions for damages.' },
  { title:'Maintenance', detail:'Tenant pays monthly maintenance charges directly to the society.' },
  { title:'Rent Increase', detail:'Landlord may increase rent by up to 7% annually upon renewal.' },
  { title:'Subletting', detail:'Not permitted without prior written consent from the landlord.' },
  { title:'Repairs', detail:"Structural repairs are the landlord's responsibility; minor upkeep is the tenant's." },
];
export let risks = [
  { level:'High', title:'Ambiguous deposit deduction clause', explanation:"The agreement doesn't define what qualifies as 'damage' before deductions are made.", why:'This gives the landlord broad discretion to withhold part of your deposit without a clear standard.', action:'Ask for a written, itemized definition of chargeable damages before signing.' },
  { level:'Medium', title:'Rent increase not clearly capped', explanation:"The 7% annual increase is mentioned but doesn't specify if it compounds or resets.", why:'Compounding increases could raise your rent faster than expected over time.', action:'Request written clarification on how the increase is calculated each year.' },
  { level:'Low', title:'Maintenance amount not fixed', explanation:'Maintenance is tied to society charges, which can change without notice.', why:'Your monthly outgoing may vary slightly month to month.', action:'Ask the landlord for the last 6 months of maintenance bills as reference.' },
];
export const recommendations = [
  'Request written clarification on deposit deduction criteria before signing.',
  'Confirm whether the 7% rent increase compounds annually or resets to the base rent.',
  'Keep a dated photo record of the property\'s condition at move-in.',
  'Set a reminder 65 days before the notice deadline to avoid auto-renewal surprises.',
];

export let reminders = [
  { id:'rem1', type:'Rent Due', title:'Rent payment for Cedar Heights', date:'5 Oct 2026', related:'Cedar Heights', status:'Upcoming' },
  { id:'rem2', type:'Notice Period', title:'Last day to give renewal notice', date:'1 Jul 2027', related:'Cedar Heights — Lease Agreement', status:'Upcoming' },
  { id:'rem3', type:'Agreement Expiry', title:'Old Adajan agreement expired', date:'30 Jun 2026', related:'Old Flat Agreement - Adajan', status:'Completed' },
  { id:'rem4', type:'Deposit Related', title:'Follow up on deposit refund', date:'20 Jul 2026', related:'Old Flat Agreement - Adajan', status:'Completed' },
];

export let notifications = [
  { id:'n1', message:'Your rental request for Cedar Heights was accepted.', time:'2 hours ago', read:false },
  { id:'n2', message:"Your agreement analysis for 'Cedar Heights - Lease Agreement.pdf' is ready.", time:'1 day ago', read:false },
  { id:'n3', message:'Your rent payment reminder is due tomorrow.', time:'1 day ago', read:true },
  { id:'n4', message:"Your agreement 'Old Flat Agreement - Adajan.pdf' expires in 30 days.", time:'3 days ago', read:true },
];

export const reports = [
  { id:'rep1', name:'Risk Analysis Report', agreement:'Cedar Heights - Lease Agreement.pdf', date:'2 Sep 2026', riskLevel:'Medium' },
  { id:'rep2', name:'Risk Analysis Report', agreement:'Old Flat Agreement - Adajan.pdf', date:'15 Jun 2026', riskLevel:'High' },
];

export const chatSuggestions = ['What is my notice period?','How much security deposit do I need to pay?','Can the landlord increase my rent?','What happens if I leave early?','Which clauses are risky?'];

export const chatResponses = {
  'what is my notice period?': "Your notice period is 60 days, and it applies after your 6-month lock-in ends on 1 Mar 2027. Giving notice before that point may still trigger the early-termination clause.",
  'how much security deposit do i need to pay?': 'Your security deposit is ₹76,500, equal to three months of rent. It is refundable within 30 days of move-out, minus any deductions for damage.',
  'can the landlord increase my rent?': 'Yes — the agreement allows the landlord to increase rent by up to 7% annually upon renewal. It doesn\'t clearly state whether this compounds each year, which is worth clarifying.',
  'what happens if i leave early?': "Leaving before your 6-month lock-in ends triggers a penalty clause: forfeiture of one month's deposit. After lock-in, you can leave with 60 days' notice.",
  'which clauses are risky?': "The main risk is the deposit deduction clause — it doesn't clearly define what counts as 'damage', giving the landlord broad discretion. The rent-increase clause is a medium risk since it isn't fully specified.",
};

export let initialChatMessages = [
  { role:'assistant', text:"Hi Ananya, I've read through your Cedar Heights lease agreement. Ask me anything about it — deposits, notice periods, risky clauses, all of it." },
];
