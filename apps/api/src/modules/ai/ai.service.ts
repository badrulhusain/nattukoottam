import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groqApiKey: string;
  private readonly groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly defaultModel = 'openai/gpt-oss-120b';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.groqApiKey =
      this.configService.get<string>('GROQ_API_KEY') ||
      process.env.GROQ_API_KEY ||
      '';
  }

  async askCivicAssistant(question: string, locality?: string, district?: string) {
    // 1. Retrieve hyper-local civic data for grounding
    const locFilter = locality || 'Kakkanad';
    const distFilter = district || 'Ernakulam';

    const [recentIssues, infrastructureProjects, projectConflicts] = await Promise.all([
      this.prisma.issue.findMany({
        where: {
          OR: [
            { locality: { contains: locFilter, mode: 'insensitive' } },
            { district: { contains: distFilter, mode: 'insensitive' } },
          ],
        },
        include: {
          department: { select: { name: true, code: true } },
          reporter: { select: { fullName: true } },
          _count: { select: { supports: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.infrastructureProject.findMany({
        where: {
          OR: [
            { locality: { contains: locFilter, mode: 'insensitive' } },
            { district: { contains: distFilter, mode: 'insensitive' } },
          ],
        },
        include: {
          department: { select: { name: true, code: true } },
        },
        take: 6,
      }),
      this.prisma.projectConflict.findMany({
        take: 4,
      }),
    ]);

    // Format context for RAG
    const issuesContext = recentIssues.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      status: i.status,
      category: i.category,
      urgency: i.urgency,
      locality: i.locality,
      address: i.address,
      department: i.department?.name || 'Local Self Government (LSGD)',
      resolutionNotes: i.resolutionNotes,
      supportsCount: i._count.supports,
    }));

    const projectsContext = infrastructureProjects.map((p) => ({
      id: p.id,
      title: p.name,
      department: p.department.name,
      status: p.status,
      startDate: p.startDate,
      expectedEndDate: p.expectedEndDate,
      locality: p.locality,
      roadName: p.roadName,
    }));

    const conflictsContext = projectConflicts.map((c) => ({
      status: c.status,
      notes: c.notes,
      jointPlan: c.jointPlan,
      distanceMeters: c.distanceMeters,
      dateOverlapDays: c.dateOverlapDays,
    }));

    const systemPrompt = `You are "Naatukoottam AI Civic Assistant (നാട്ടുകൂട്ടം പൗരസഹായി)", an intelligent, warm, and highly knowledgeable civic advisor for citizens in Kerala, India.

Your mission is to answer citizens' questions about local infrastructure, road works, water supply, electricity, garbage collection, and ongoing government projects strictly grounded in live ward data.

GROUNDING RULES:
1. Always base your answers on the provided DATABASE CONTEXT.
2. If relevant complaints or projects exist in the data, cite the specific issue title, responsible department (PWD, KWA, KSEB, LSGD, etc.), and current status (e.g., Reported, In Progress, Waiting for Coordination, Resolved).
3. If an issue is delayed due to interdepartmental coordination (such as pipe laying before road tarring), explain the coordination plan politely.
4. If no specific records exist for their exact question or road, state that no active complaint has been filed yet, and encourage them to click the "+" button in Naatukoottam to submit a GPS-tagged complaint so local ward officials are notified.
5. Answer in the same language the user asks:
   - If user asks in Malayalam or Manglish, reply in fluent, natural Malayalam (മലയാളത്തിൽ മറുപടി നൽകുക).
   - If user asks in English, reply in clear, professional English with Malayalam terms where helpful.
6. Keep answers concise, actionable, and formatted with bullet points for readability.

DATABASE CONTEXT FOR THIS WARD (${locFilter}, ${distFilter}):
Recent Civic Complaints:
${JSON.stringify(issuesContext, null, 2)}

Active Infrastructure Projects:
${JSON.stringify(projectsContext, null, 2)}

Interdepartmental Conflicts & Coordination Plans:
${JSON.stringify(conflictsContext, null, 2)}`;

    try {
      const response = await fetch(this.groqBaseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Groq API error: ${response.status} ${errorText}`);
        throw new Error('Groq AI service unavailable');
      }

      const json = await response.json();
      const answer =
        json.choices?.[0]?.message?.content ||
        'സഹായിക്കാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക.';

      return {
        answer,
        relevantIssues: recentIssues.slice(0, 3).map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          status: i.status,
          locality: i.locality,
          department: i.department?.name,
        })),
        relevantProjects: infrastructureProjects.slice(0, 2).map((p) => ({
          id: p.id,
          title: p.name,
          status: p.status,
          department: p.department.name,
        })),
      };
    } catch (err: any) {
      this.logger.error('Failed to generate civic response:', err);
      return {
        answer:
          'ക്ഷമിക്കണം, AI പൗരസഹായിയുമായുള്ള ബന്ധം താല്ക്കാലികമായി ലഭ്യമല്ല. ദയവായി നിങ്ങളുടെ വാർഡിലെ പ്രശ്നങ്ങൾ ഹോം പേജിലോ മാപ്പിലോ നേരിട്ട് പരിശോധിക്കുക.',
        relevantIssues: [],
        relevantProjects: [],
      };
    }
  }

  async translateText(text: string, targetLang: 'en' | 'ml' | 'ta') {
    const langNames: Record<string, string> = {
      en: 'English',
      ml: 'Malayalam (മലയാളം)',
      ta: 'Tamil (தமிழ்)',
    };

    const targetLangName = langNames[targetLang] || 'English';

    const systemPrompt = `You are a high-accuracy translator for Kerala civic discussions and community complaints.
Translate the user text into ${targetLangName}.
CRITICAL RULES:
- Translate accurately preserving local meaning, tone, and street/ward names.
- Output ONLY the translated text. Do not add introductory remarks, notes, or quotation marks.`;

    try {
      const response = await fetch(this.groqBaseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq translation failed: ${response.status}`);
      }

      const json = await response.json();
      const translatedText = json.choices?.[0]?.message?.content?.trim() || text;

      return {
        translatedText,
        targetLang,
      };
    } catch (err: any) {
      this.logger.warn('Translation failed, returning original text:', err.message);
      return {
        translatedText: text,
        targetLang,
      };
    }
  }
}

