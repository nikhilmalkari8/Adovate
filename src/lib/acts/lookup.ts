import constitution from '@/data/acts/constitution.json'
import ipc from '@/data/acts/ipc.json'

interface Section {
  section: string
  title: string
  text: string
  citation: string
}

interface ActData {
  name: string
  shortName: string
  sections: Section[]
}

const acts: Record<string, ActData> = {
  constitution: constitution as ActData,
  ipc: ipc as ActData,
}

export async function lookupSection(
  actKey: string,
  sectionNum: string
): Promise<Section | null> {
  const act = acts[actKey]
  if (!act) return null

  const section = act.sections.find(
    (s) => s.section.toLowerCase() === sectionNum.toLowerCase()
  )
  
  return section || null
}

export async function searchActs(query: string): Promise<Section[]> {
  const results: Section[] = []
  const queryLower = query.toLowerCase()
  const keywords = queryLower.split(/\s+/).filter((w) => w.length > 3)

  for (const act of Object.values(acts)) {
    for (const section of act.sections) {
      const searchText = `${section.title} ${section.text}`.toLowerCase()
      const matchCount = keywords.filter((kw) => searchText.includes(kw)).length
      
      if (matchCount >= Math.min(2, keywords.length)) {
        results.push(section)
        if (results.length >= 3) break
      }
    }
    if (results.length >= 3) break
  }

  return results
}
