import { useState, memo } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import './App.css';

import regularFont from './fonts/lmroman10-regular.otf';
import boldFont from './fonts/lmroman10-bold.otf';
import italicFont from './fonts/lmroman10-italic.otf';

Font.register({
  family: 'Latin Modern',
  fonts: [
    { src: regularFont },
    { src: boldFont, fontWeight: 'bold' },
    { src: italicFont, fontStyle: 'italic' }
  ]
});

// Security Constants
const MAX_ZIP_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit for initial archive
const MAX_UNCOMPRESSED_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB limit for extracted data

interface ResumeData {
  profile?: ProfileData;
  positions?: PositionData[];
  education?: EducationData[];
}

interface ProfileData {
  "First Name": string;
  "Last Name": string;
  Headline: string;
  Summary: string;
}

interface PositionData {
  "Company Name": string;
  Description: string;
  "Finished On": string;
  Location: string;
  "Started On": string;
  Title: string;
}

interface EducationData {
  Activities: string;
  "Degree Name": string;
  "End Date": string;
  Notes: string;
  "School Name": string;
  "Start Date": string;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Latin Modern', fontSize: 11, lineHeight: 1.15 },
  header: { alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 24, marginBottom: 10, fontFamily: 'Latin Modern', fontWeight: 'bold', lineHeight: 1 },
  contact: { fontSize: 11 },
  sectionTitle: { 
    fontSize: 12, 
    fontFamily: 'Latin Modern', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    borderBottomWidth: 1, 
    borderBottomColor: '#000', 
    marginTop: 12, 
    paddingBottom: 6, 
    marginBottom: 0
  },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  jobBlock: { marginTop: 8 },
  bold: { fontFamily: 'Latin Modern', fontWeight: 'bold' },
  italic: { fontFamily: 'Latin Modern', fontStyle: 'italic' },
  date: { fontFamily: 'Latin Modern', fontStyle: 'normal'  },
  bulletRow: { flexDirection: 'row', marginTop: 4, paddingLeft: 12 },
  bullet: { width: 12, fontSize: 10, fontFamily: 'Latin Modern' },
  description: { flex: 1, textAlign: 'left'}
});

const normalizePositions = (positions: PositionData[]): PositionData[] => {
  return positions.map(job => {
    if (!job.Description) return job;

    const cleanedDescription = job.Description
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Resolved ReDoS risk by removing unanchored \s* capture groups
      .replace(/[ \t]*(?:[\u2022-\u2027\u25A0-\u25FF\u2700-\u27BF\u2190-\u21FF\u00AA\u1D43]|\^a)[ \t]*/g, '\n')
      .replace(/(â€¢|â\x80\xA2|â¦|â|ï‚·)/g, '\n');

    return {
      ...job,
      Description: cleanedDescription
    };
  });
};

const ResumeDocument = ({ data }: { data: ResumeData }) => {
  const { profile, positions = [], education = [] } = data;
  
  if (!profile) return null;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        <View style={styles.header}>
          <Text style={styles.name}>{profile["First Name"]} {profile["Last Name"]}</Text>
          <Text style={styles.contact}>{profile.Headline}</Text>
        </View>

        {positions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {positions.map((job, index) => (
              <View key={index} style={styles.jobBlock}>
                <View style={styles.flexRow}>
                  <Text style={styles.bold}>{job.Title} | {job["Company Name"]}</Text>
                  <Text style={styles.date}>{job["Started On"]} – {job["Finished On"] || "Present"}</Text>
                </View>
                
                {job.Location && (
                  <View style={styles.flexRow}>
                    <Text />
                    <Text style={styles.italic}>{job.Location}</Text>
                  </View>
                )}
                
                {job.Description && job.Description
                  .split('\n')
                  .map(line => line.replace(/^[-–—\s]+/, '').trim())
                  .filter(line => line.length > 2)
                  .map((bullet, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>-</Text>
                    <Text style={styles.description}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.jobBlock}>
                <View style={styles.flexRow}>
                  <Text style={styles.bold}>{edu["Degree Name"]} | {edu["School Name"]}</Text>
                  <Text style={styles.date}>{edu["Start Date"]} – {edu["End Date"] || "Present"}</Text>
                </View>
                
                {edu.Activities && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.description}><Text style={styles.italic}>Activities:</Text> {edu.Activities}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

const parseCSV = <T,>(csvText: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error)
    });
  });
};

const PDFPreviewSection = memo(({ data }: { data: ResumeData }) => (
  <>
    <div className="pdf-preview-container">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <ResumeDocument data={data} />
      </PDFViewer>
    </div>

    <PDFDownloadLink 
      document={<ResumeDocument data={data} />} 
      fileName={`${data.profile?.["First Name"]}-${data.profile?.["Last Name"]}-Resume.pdf`}
      className="download-button"
    >
      {({ loading }: { loading: boolean }) => (loading ? 'Compiling PDF...' : 'Download ATS PDF')}
    </PDFDownloadLink>
  </>
));

function truncateFilename(rawFilename: string, maxLength: number = 30): string {
  // Strip control characters before evaluating length or display
  const filename = rawFilename.replace(/[\x00-\x1F\x7F]/g, '');
  
  if (filename.length <= maxLength) return filename;
  
  const extensionIndex = filename.lastIndexOf('.');
  const extension = extensionIndex !== -1 ? filename.slice(extensionIndex) : '';
  const nameWithoutExt = extensionIndex !== -1 ? filename.slice(0, extensionIndex) : filename;
  
  const charsToShow = maxLength - extension.length - 3; 
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  
  return (
    nameWithoutExt.slice(0, frontChars) +
    '...' +
    nameWithoutExt.slice(nameWithoutExt.length - backChars) +
    extension
  );
}

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate initial archive size
      if (file.size > MAX_ZIP_FILE_SIZE) {
        console.error(`Archive exceeds size limit of ${MAX_ZIP_FILE_SIZE} bytes.`);
        return;
      }

      setFileName(file.name);
      
      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        
        const fileMap: Record<string, keyof ResumeData> = {
          'Profile.csv': 'profile',
          'Positions.csv': 'positions',
          'Education.csv': 'education'
        };
        
        const extractedData: ResumeData = {};
        let totalUncompressedSize = 0;
        
        for (const relativePath in loadedZip.files) {
          const zipEntry = loadedZip.files[relativePath];
          const entryName = relativePath.split('/').pop() || "";
          
          if (
            zipEntry.dir || 
            !entryName.endsWith('.csv') || 
            !fileMap[entryName] ||
            relativePath.includes('__MACOSX') ||
            entryName.startsWith('.')
          ) {
            continue;
          }
          
          const csvText = await zipEntry.async("string");
          
          // Track and enforce uncompressed data limits
          totalUncompressedSize += csvText.length;
          if (totalUncompressedSize > MAX_UNCOMPRESSED_TOTAL_SIZE) {
            throw new Error("Decompression limit exceeded. Aborting to prevent memory exhaustion.");
          }

          if (entryName === 'Positions.csv') {
            const parsedData = await parseCSV<PositionData>(csvText);
            extractedData.positions = normalizePositions(parsedData);
          } else if (entryName === 'Profile.csv') {
            const parsedData = await parseCSV<ProfileData>(csvText);
            extractedData.profile = parsedData[0];
          } else if (entryName === 'Education.csv') {
            const parsedData = await parseCSV<EducationData>(csvText);
            extractedData.education = parsedData;
          }
        }
        
        setResumeData(extractedData);
      } catch (error) {
        console.error("The engine failed to read the zip file:", error);
      }
    }
  };

  return (
    <div className="app-container">
      <h1>ATS Resume Builder</h1>
      <p className="app-description">Upload your LinkedIn data archive (.zip) below to generate your ATS-compliant resume.</p>
      
      <div className="upload-wrapper">
        <label htmlFor="file-upload" className="custom-file-upload">
          {fileName ? 'Change File' : 'Select .zip'}
        </label>
        <input 
          id="file-upload"
          type="file" 
          accept=".zip" 
          onChange={handleFileUpload} 
          className="custom-file-input"
        />
        {fileName && (
          <span 
            className="file-name-display" 
            title={fileName.replace(/[\x00-\x1F\x7F]/g, '')}
          >
            {truncateFilename(fileName, 35)}
          </span>
        )}
      </div>

      {resumeData && resumeData.profile && (
        <PDFPreviewSection data={resumeData} />
      )}
    </div>
  );
}