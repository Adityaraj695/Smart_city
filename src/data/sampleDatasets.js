// Sample Real-world GeoJSON Datasets for Smart City Infrastructure Analysis

// Center Coordinates: Patiala, Punjab (approx 30.3398° N, 76.3869° E)
export const PATIALA_CENTER = [30.3398, 76.3869];

// 1. Patiala Sector 4 & Urban Core Dataset (Default)
// Note: Intentionally DOES NOT include Power Outage data, to demonstrate the strict no-assumption principle.
export const patialaSectorDataset = {
  id: 'patiala-sector-4',
  name: 'Patiala Sector 4 & Central Core',
  auditDate: 'September 2026',
  areaKm2: 14.8,
  estimatedPopulation: 68400,
  hasPowerData: false, // Explicitly false!
  geoJson: {
    type: 'FeatureCollection',
    features: [
      // Roads (Arterials & Main Streets)
      {
        type: 'Feature',
        id: 'road-1',
        properties: { name: 'Rajbaha Road Arterial', category: 'road', type: 'primary', lanes: 4, speedLimit: 50 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.368, 30.332],
            [76.380, 30.338],
            [76.395, 30.342],
            [76.412, 30.346]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'road-2',
        properties: { name: 'Mall Road Collector', category: 'road', type: 'secondary', lanes: 2, speedLimit: 40 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.375, 30.355],
            [76.382, 30.345],
            [76.388, 30.330],
            [76.391, 30.320]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'road-3',
        properties: { name: 'Northern Bypass Corridor', category: 'road', type: 'primary', lanes: 4, speedLimit: 60 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.360, 30.358],
            [76.385, 30.362],
            [76.410, 30.360],
            [76.425, 30.354]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'road-4',
        properties: { name: 'Sector 4 Internal Link', category: 'road', type: 'residential', lanes: 2, speedLimit: 30 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.380, 30.338],
            [76.384, 30.335],
            [76.390, 30.336],
            [76.396, 30.332]
          ]
        }
      },

      // Water Supply Pipelines
      {
        type: 'Feature',
        id: 'water-pipe-1',
        properties: { name: 'Central Supply Main A', category: 'water', diameterMm: 600, status: 'operational', pressureBar: 4.2 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.370, 30.333],
            [76.381, 30.339],
            [76.393, 30.341],
            [76.405, 30.344]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'water-pipe-2',
        properties: { name: 'Southern Distribution Loop', category: 'water', diameterMm: 350, status: 'operational', pressureBar: 3.8 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.381, 30.339],
            [76.385, 30.328],
            [76.394, 30.325]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'water-pipe-3',
        properties: { name: 'Western Feeder Line', category: 'water', diameterMm: 300, status: 'operational', pressureBar: 3.5 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.370, 30.348],
            [76.375, 30.340],
            [76.380, 30.338]
          ]
        }
      },

      // Storm Drainage Network
      {
        type: 'Feature',
        id: 'drain-1',
        properties: { name: 'Badi Nadi Storm Outfall', category: 'drainage', widthM: 4.5, type: 'open_channel', maintenance: 'fair' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.365, 30.326],
            [76.380, 30.328],
            [76.398, 30.332],
            [76.415, 30.338]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'drain-2',
        properties: { name: 'Central Enclosed Culvert', category: 'drainage', widthM: 2.2, type: 'enclosed_conduit', maintenance: 'good' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.378, 30.348],
            [76.382, 30.342],
            [76.385, 30.335]
          ]
        }
      },

      // Healthcare Facilities (Hospitals, Clinics, Dispensaries)
      {
        type: 'Feature',
        id: 'health-1',
        properties: {
          name: 'Government Rajindra Hospital',
          category: 'healthcare',
          amenity: 'hospital',
          beds: 650,
          emergency24x7: true,
          catchmentRadiusKm: 3.0,
          sector: 'Central District'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3812, 30.3345]
        }
      },
      {
        type: 'Feature',
        id: 'health-2',
        properties: {
          name: 'Model Town Community Health Centre',
          category: 'healthcare',
          amenity: 'clinic',
          beds: 45,
          emergency24x7: false,
          catchmentRadiusKm: 1.5,
          sector: 'Model Town West'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3695, 30.3392]
        }
      },
      {
        type: 'Feature',
        id: 'health-3',
        properties: {
          name: 'Civil Lines Urban Dispensary',
          category: 'healthcare',
          amenity: 'clinic',
          beds: 15,
          emergency24x7: false,
          catchmentRadiusKm: 1.2,
          sector: 'Civil Lines'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3898, 30.3458]
        }
      },

      // Educational Facilities (Schools & Colleges)
      {
        type: 'Feature',
        id: 'edu-1',
        properties: {
          name: 'Govt. Senior Secondary Model School',
          category: 'education',
          amenity: 'school',
          capacity: 1400,
          gradeLevels: 'K-12',
          catchmentRadiusKm: 1.8,
          sector: 'Central Core'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3785, 30.3382]
        }
      },
      {
        type: 'Feature',
        id: 'edu-2',
        properties: {
          name: 'Thapar Urban Polytechnic & College',
          category: 'education',
          amenity: 'college',
          capacity: 3200,
          gradeLevels: 'Higher Education',
          catchmentRadiusKm: 3.5,
          sector: 'East Tech Hub'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3642, 30.3540]
        }
      },
      {
        type: 'Feature',
        id: 'edu-3',
        properties: {
          name: 'Patiala Girls Senior Public School',
          category: 'education',
          amenity: 'school',
          capacity: 1100,
          gradeLevels: 'K-12',
          catchmentRadiusKm: 1.5,
          sector: 'Civil Lines South'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3860, 30.3315]
        }
      },
      {
        type: 'Feature',
        id: 'edu-4',
        properties: {
          name: 'St. Peter Academy',
          category: 'education',
          amenity: 'school',
          capacity: 850,
          gradeLevels: 'K-10',
          catchmentRadiusKm: 1.2,
          sector: 'Model Town Core'
        },
        geometry: {
          type: 'Point',
          coordinates: [76.3725, 30.3440]
        }
      },

      // Building Clusters / Footprint Polygons
      {
        type: 'Feature',
        id: 'bld-cluster-north',
        properties: {
          name: 'Northern Residential Block A-D',
          category: 'building',
          type: 'residential_high_density',
          estimatedPopulation: 14200,
          buildingUnits: 480,
          avgDistanceToHospitalKm: 3.2,
          avgDistanceToSchoolKm: 2.1
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [76.398, 30.358],
            [76.415, 30.359],
            [76.417, 30.350],
            [76.399, 30.349],
            [76.398, 30.358]
          ]]
        }
      },
      {
        type: 'Feature',
        id: 'bld-cluster-east-dense',
        properties: {
          name: 'Eastern Mixed Dense Quarter',
          category: 'building',
          type: 'mixed_commercial_residential',
          estimatedPopulation: 18500,
          buildingUnits: 620,
          drainageDistanceM: 380,
          floodRiskIndex: 'High'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [76.402, 30.338],
            [76.418, 30.340],
            [76.419, 30.330],
            [76.404, 30.328],
            [76.402, 30.338]
          ]]
        }
      },
      {
        type: 'Feature',
        id: 'bld-cluster-central',
        properties: {
          name: 'Sector 4 Central Core Residential',
          category: 'building',
          type: 'residential_medium_density',
          estimatedPopulation: 22000,
          buildingUnits: 810,
          avgDistanceToHospitalKm: 0.8,
          avgDistanceToSchoolKm: 0.5
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [76.376, 30.342],
            [76.388, 30.344],
            [76.389, 30.334],
            [76.377, 30.332],
            [76.376, 30.342]
          ]]
        }
      }
    ]
  }
};

// Summary metrics & official recommendations for Patiala Sector 4 (Default View)
export const initialMetrics = {
  totalIssues: 24,
  highPriority: 6,
  mediumPriority: 11,
  lowPriority: 7,
  recommendationsCount: 18,
  dataAvailability: {
    buildings: { available: true, count: 142, label: 'Buildings (Footprints & Clusters)', status: 'verified' },
    roads: { available: true, count: 86, label: 'Road Network (Arterial & Local)', status: 'verified' },
    healthcare: { available: true, count: 8, label: 'Healthcare Facilities (Hospitals & Clinics)', status: 'verified' },
    education: { available: true, count: 9, label: 'Educational Facilities (Schools & Colleges)', status: 'verified' },
    water: { available: true, count: 44, label: 'Water Supply Network (Mains & Feeders)', status: 'verified' },
    drainage: { available: true, count: 38, label: 'Drainage Network (Stormwater Outfalls)', status: 'verified' },
    power: {
      available: false,
      count: 0,
      label: 'Power Outage Telemetry & Grid Nodes',
      status: 'missing',
      notice: 'Power outage telemetry is missing from the uploaded GeoJSON dataset. To preserve audit integrity, power gap calculations are locked and not synthesized.'
    }
  }
};

// Detailed List of Detected Infrastructure Issues
export const detectedIssues = [
  {
    id: 'ISSUE-01',
    category: 'Healthcare',
    problem: 'Limited healthcare access in the northern residential area.',
    location: 'Northern Residential Zone (Sector 4B)',
    severity: 8.5,
    priority: 'HIGH',
    coordinates: [30.355, 76.408],
    affectedPopulation: 14200,
    metrics: { distanceToClinicKm: 3.2, transitTimeMin: 22, targetMaxMin: 15 }
  },
  {
    id: 'ISSUE-02',
    category: 'Water & Drainage',
    problem: 'Building-dense area with limited nearby drainage coverage.',
    location: 'Eastern Mixed Dense Quarter',
    severity: 7.8,
    priority: 'HIGH',
    coordinates: [30.334, 76.411],
    affectedPopulation: 18500,
    metrics: { distanceToDrainM: 380, standardMaxM: 150, runOffCoefficient: 0.85 }
  },
  {
    id: 'ISSUE-03',
    category: 'Education',
    problem: 'Low availability of educational facilities in the eastern region.',
    location: 'Eastern Greenfield Expansion Zone',
    severity: 6.2,
    priority: 'MEDIUM',
    coordinates: [30.347, 76.418],
    affectedPopulation: 9800,
    metrics: { studentCapacityDeficit: 620, avgCommuteKm: 2.8 }
  },
  {
    id: 'ISSUE-04',
    category: 'Water & Drainage',
    problem: 'Water distribution pressure drop during peak morning hours.',
    location: 'Western Feeder Node (W-12)',
    severity: 7.1,
    priority: 'HIGH',
    coordinates: [30.344, 76.372],
    affectedPopulation: 11200,
    metrics: { terminalPressureBar: 1.4, thresholdMinBar: 2.5 }
  },
  {
    id: 'ISSUE-05',
    category: 'Healthcare',
    problem: 'Sub-centre deficit for pediatric and geriatric emergency triage.',
    location: 'Old City Wall Peripheral Sector',
    severity: 7.6,
    priority: 'HIGH',
    coordinates: [30.328, 76.385],
    affectedPopulation: 16400,
    metrics: { responseTimeMin: 26, standardMin: 10 }
  },
  {
    id: 'ISSUE-06',
    category: 'Education',
    problem: 'Over-enrolled primary public school with no secondary feeder branch.',
    location: 'Model Town South Ward 14',
    severity: 6.8,
    priority: 'MEDIUM',
    coordinates: [30.337, 76.368],
    affectedPopulation: 7600,
    metrics: { pupilTeacherRatio: '46:1', stateTarget: '30:1' }
  },
  {
    id: 'ISSUE-07',
    category: 'Water & Drainage',
    problem: 'Open stormwater channel prone to silt accumulation and backflow.',
    location: 'Badi Nadi Confluence Reach 2',
    severity: 6.5,
    priority: 'MEDIUM',
    coordinates: [30.330, 76.402],
    affectedPopulation: 12000,
    metrics: { siltationLevel: '65%', drainageCapacityLoss: '40%' }
  },
  {
    id: 'ISSUE-08',
    category: 'Healthcare',
    problem: 'Absence of 24-hour diagnostic dispensary within 2 km radius.',
    location: 'North-West Tech Housing Sector',
    severity: 5.9,
    priority: 'MEDIUM',
    coordinates: [30.358, 76.375],
    affectedPopulation: 8300,
    metrics: { distanceToDispensaryKm: 2.4 }
  },
  {
    id: 'ISSUE-09',
    category: 'Education',
    problem: 'Safe pedestrian crossing missing along arterial highway near school.',
    location: 'Rajbaha Road / School Junction',
    severity: 5.4,
    priority: 'MEDIUM',
    coordinates: [30.338, 76.381],
    affectedPopulation: 3500,
    metrics: { pedestrianAccidentRisk: 'Moderate-High', crossingDistanceM: 24 }
  },
  {
    id: 'ISSUE-10',
    category: 'Water & Drainage',
    problem: 'Dead-end water main with residual stagnant chlorine decay.',
    location: 'Civil Lines Extension Cul-de-sac',
    severity: 4.8,
    priority: 'LOW',
    coordinates: [30.348, 76.392],
    affectedPopulation: 2900,
    metrics: { chlorinePpm: 0.12, targetMin: 0.2 }
  },
  {
    id: 'ISSUE-11',
    category: 'Education',
    problem: 'Digital library and lab shortage in secondary educational cluster.',
    location: 'Central Public School Campus',
    severity: 4.2,
    priority: 'LOW',
    coordinates: [30.339, 76.383],
    affectedPopulation: 1400,
    metrics: { computerToStudentRatio: '1:38' }
  },
  {
    id: 'ISSUE-12',
    category: 'Healthcare',
    problem: 'Inadequate dedicated ambulance turnaround bay at urban clinic.',
    location: 'Model Town Health Centre Entry',
    severity: 4.1,
    priority: 'LOW',
    coordinates: [30.339, 76.370],
    affectedPopulation: 4200,
    metrics: { egressClearanceM: 3.1, recommendedM: 5.5 }
  }
];

// Detailed Recommendations matching prompt structure
export const recommendations = [
  {
    id: 'REC-01',
    category: 'Healthcare Services',
    icon: 'healthcare',
    problemDetected: 'Poor accessibility to healthcare facilities.',
    location: 'Northern Residential Zone',
    coordinates: [30.355, 76.408],
    reason: 'High building density combined with a large distance (3.2 km) from existing healthcare facilities, exceeding the 15-minute emergency reach threshold.',
    severityScore: 8.5,
    priority: 'HIGH',
    suggestedAction: 'Consider establishing a healthcare facility (Urban Primary Health Centre / UPHC) or improving access to the nearest existing facility with dedicated feeder transport.',
    estimatedBudget: '₹ 1.85 Cr ($220k USD)',
    timeHorizon: 'Short Term (6-12 Months)',
    impactBeneficiaries: '14,200 residents'
  },
  {
    id: 'REC-02',
    category: 'Water & Drainage',
    icon: 'water',
    problemDetected: 'Severe stormwater flooding vulnerability in high-density cluster.',
    location: 'Eastern Mixed Dense Quarter',
    coordinates: [30.334, 76.411],
    reason: 'Rapid urban impervious surface expansion with nearest trunk storm drain situated 380m away, leading to seasonal waterlogging during monsoon downpours.',
    severityScore: 7.8,
    priority: 'HIGH',
    suggestedAction: 'Construct a 1.2km reinforced box-culvert stormwater collector pipe linking Eastern Quarter to Badi Nadi outfall, accompanied by permeable pavement retrofits.',
    estimatedBudget: '₹ 2.40 Cr ($290k USD)',
    timeHorizon: 'Immediate Priority (3-6 Months)',
    impactBeneficiaries: '18,500 residents'
  },
  {
    id: 'REC-03',
    category: 'Healthcare Services',
    icon: 'healthcare',
    problemDetected: 'Emergency triage bottleneck in Old City Peripheral Sector.',
    location: 'Old City Wall Peripheral Sector',
    coordinates: [30.328, 76.385],
    reason: 'Narrow street grid and distance to Rajindra Hospital creates 26-minute ambulance transit latency during peak traffic periods.',
    severityScore: 7.6,
    priority: 'HIGH',
    suggestedAction: 'Deploy a 24x7 First-Responder Emergency Stabilization Kiosk and designate a dedicated green emergency corridor for medical transport.',
    estimatedBudget: '₹ 65 Lakhs ($78k USD)',
    timeHorizon: 'Immediate (2-4 Months)',
    impactBeneficiaries: '16,400 residents'
  },
  {
    id: 'REC-04',
    category: 'Water & Drainage',
    icon: 'water',
    problemDetected: 'Hydraulic pressure collapse on Western residential grid.',
    location: 'Western Feeder Node (W-12)',
    coordinates: [30.344, 76.372],
    reason: 'Pipeline bottleneck where 600mm main downscales abruptly to 200mm without intermediate booster pumping or storage equalization.',
    severityScore: 7.1,
    priority: 'HIGH',
    suggestedAction: 'Install a smart VFD booster pumping station with inline telemetry pressure sensors and loop the Western feed into Sector 4 core.',
    estimatedBudget: '₹ 95 Lakhs ($115k USD)',
    timeHorizon: 'Medium Term (6-9 Months)',
    impactBeneficiaries: '11,200 residents'
  },
  {
    id: 'REC-05',
    category: 'Education Services',
    icon: 'education',
    problemDetected: 'Severe secondary school capacity deficit in expanding eastern suburbs.',
    location: 'Eastern Greenfield Expansion Zone',
    coordinates: [30.347, 76.418],
    reason: 'Over 620 school-age children must commute more than 2.8km across high-speed arterial bypass roads to reach nearest government senior secondary school.',
    severityScore: 6.2,
    priority: 'MEDIUM',
    suggestedAction: 'Sanction municipal land parcel for an 800-seat Composite Model Senior Secondary School with integrated STEM laboratory facilities.',
    estimatedBudget: '₹ 3.10 Cr ($370k USD)',
    timeHorizon: 'Medium Term (12-18 Months)',
    impactBeneficiaries: '9,800 residents'
  },
  {
    id: 'REC-06',
    category: 'Education Services',
    icon: 'education',
    problemDetected: 'Dangerous arterial school crossing with zero pedestrian calming.',
    location: 'Rajbaha Road / School Junction',
    coordinates: [30.338, 76.381],
    reason: 'High-speed arterial vehicular traffic intersects heavy morning student footfall with absence of signaled pelican crossing or speed-table.',
    severityScore: 5.4,
    priority: 'MEDIUM',
    suggestedAction: 'Implement a Smart School Safety Zone: raised pedestrian tabletop crosswalk, solar-powered radar speed feedback signs, and amber pedestrian beacons.',
    estimatedBudget: '₹ 18 Lakhs ($22k USD)',
    timeHorizon: 'Immediate (1 Month)',
    impactBeneficiaries: '3,500 students & guardians'
  }
];

// Highlighted GIS Gap Zones on Map
export const mapGapZones = [
  {
    id: 'gap-health-north',
    name: 'Underserved Healthcare Gap Zone',
    category: 'healthcare',
    severity: 8.5,
    priority: 'HIGH',
    coordinates: [30.355, 76.408],
    radiusMeters: 900,
    color: '#ef4444',
    fillColor: '#ef4444',
    description: 'High building density zone located 3.2km from nearest hospital facility. High vulnerability deficit.'
  },
  {
    id: 'gap-drainage-east',
    name: 'Drainage Deficit & Waterlogging Vulnerability Zone',
    category: 'drainage',
    severity: 7.8,
    priority: 'HIGH',
    coordinates: [30.334, 76.411],
    radiusMeters: 750,
    color: '#3b82f6',
    fillColor: '#0284c7',
    description: 'Zero storm drainage access within 380 meters of dense multi-story residential blocks.'
  },
  {
    id: 'gap-edu-east',
    name: 'Underserved Education Zone',
    category: 'education',
    severity: 6.2,
    priority: 'MEDIUM',
    coordinates: [30.347, 76.418],
    radiusMeters: 800,
    color: '#8b5cf6',
    fillColor: '#a855f7',
    description: 'Educational catchment void: student travel distances exceed permissible urban planning criteria.'
  }
];

// Proposed Municipal Intervention Pinpoints on Map
export const mapInterventions = [
  {
    id: 'int-health-1',
    name: 'Proposed Urban Primary Health Centre (UPHC)',
    category: 'healthcare',
    coordinates: [30.356, 76.406],
    type: 'proposed_facility',
    details: 'Proposed 20-bed emergency & maternity clinic site directly addressing Issue #ISSUE-01.'
  },
  {
    id: 'int-drain-1',
    name: 'Proposed Trunk Stormwater Drain Extension',
    category: 'drainage',
    coordinates: [30.333, 76.408],
    type: 'proposed_infrastructure',
    details: 'Proposed 1.2km underground reinforced culvert connecting Eastern quarter to Badi Nadi.'
  },
  {
    id: 'int-edu-1',
    name: 'Proposed Composite Model Senior Secondary School',
    category: 'education',
    coordinates: [30.348, 76.416],
    type: 'proposed_facility',
    details: 'Proposed 800-capacity public model school with safe designated sidewalk access.'
  }
];

// Preloaded History Log
export const analysisHistoryLog = [
  {
    id: 'hist-1',
    title: 'Patiala Sector 4 Analysis',
    date: 'September 2026',
    analyst: 'Chief Urban Planning Directorate',
    recommendationsCount: 18,
    issuesCount: 24,
    status: 'Active Snapshot',
    coverageScore: '74.2%',
    dataCompleteness: '6 / 7 Categories Available (Power Outage Telemetry Omitted)'
  },
  {
    id: 'hist-2',
    title: 'Urban Area Infrastructure Analysis (Metro East)',
    date: 'August 2026',
    analyst: 'Regional Smart City Authority',
    recommendationsCount: 12,
    issuesCount: 16,
    status: 'Archived Baseline',
    coverageScore: '68.5%',
    dataCompleteness: '5 / 7 Categories Available'
  },
  {
    id: 'hist-3',
    title: 'Greenfield District Infrastructure Audit',
    date: 'June 2026',
    analyst: 'Municipal Infrastructure Council',
    recommendationsCount: 9,
    issuesCount: 11,
    status: 'Archived Baseline',
    coverageScore: '88.1%',
    dataCompleteness: '7 / 7 Categories Available (Full Telemetry)'
  }
];
