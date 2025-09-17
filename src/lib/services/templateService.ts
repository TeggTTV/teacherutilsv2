// Template service for storing and retrieving game templates
export interface TemplateData {
  id?: string;
  title: string;
  type: string;
  data: {
    categories: Array<{
      id: string;
      name: string;
      questions: Array<{
        id: string;
        value: number;
        question: string;
        answer: string;
        isAnswered: boolean;
        media?: unknown;
        timer?: number;
        difficulty?: string;
      }>;
    }>;
    displayImage?: string;
    boardBackground?: string;
    boardCustomizations?: unknown;
  };
}

class TemplateService {
  private static STORAGE_KEY = 'pending-template';

  // Store template data in session storage
  static storeTemplate(templateData: TemplateData): string {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        id: templateId,
        data: templateData,
        timestamp: Date.now()
      }));
      return templateId;
    } catch (error) {
      console.error('Failed to store template:', error);
      throw new Error('Failed to store template data');
    }
  }

  // Retrieve template data from session storage
  static getTemplate(): TemplateData | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Check if template is not too old (1 hour max)
      if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
        this.clearTemplate();
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to retrieve template:', error);
      this.clearTemplate();
      return null;
    }
  }

  // Clear template data
  static clearTemplate(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear template:', error);
    }
  }

  // Check if template exists
  static hasTemplate(): boolean {
    try {
      return !!sessionStorage.getItem(this.STORAGE_KEY);
    } catch {
      return false;
    }
  }
}

export default TemplateService;