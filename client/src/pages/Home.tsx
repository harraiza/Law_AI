import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatWidget from "@/components/ChatWidget";
import { Scale, MessageCircle, ArrowRight, Check, MapPin, Star, Phone, Mail } from "lucide-react";
import { useState } from "react";

const features = [
  {
    title: "Constitutional Knowledge",
    description: "Complete Pakistani Constitution database with real Supreme Court cases"
  },
  {
    title: "Bilingual Support", 
    description: "Ask questions in Urdu or English and get accurate legal guidance"
  },
  {
    title: "Expert Lawyer Network",
    description: "Connect with verified Pakistani lawyers specialized in your legal area"
  },
  {
    title: "Voice Recognition",
    description: "Speak your legal questions naturally in both languages"
  }
];

const commonQuestions = [
  "Can police arrest without a warrant?",
  "What are dowry laws in Pakistan?", 
  "How to file a cybercrime complaint?",
  "What does the Constitution say about women's rights?"
];

const featuredLawyers = [
  {
    id: 1,
    name: "Ahmed Ali Khan",
    specialization: "Criminal Law",
    experience: 15,
    region: "Lahore",
    rating: 4.9,
    cases: 250,
    contact: "+92-300-1234567",
    email: "ahmed.khan@lawfirm.pk",
    bio: "Senior criminal lawyer with extensive experience in constitutional law and human rights cases.",
    specialties: ["Criminal Defense", "Constitutional Law", "Human Rights"]
  },
  {
    id: 2,
    name: "Dr. Yasmeen Hassan",
    specialization: "Family Law",
    experience: 18,
    region: "Islamabad",
    rating: 4.8,
    cases: 300,
    contact: "+92-345-9876543",
    email: "yasmeen.hassan@familylaw.pk",
    bio: "Leading family law expert specializing in women's rights and inheritance disputes.",
    specialties: ["Family Law", "Women's Rights", "Inheritance"]
  },
  {
    id: 3,
    name: "Advocate Nighat Dad",
    specialization: "Cyber Law",
    experience: 10,
    region: "Lahore",
    rating: 4.7,
    cases: 180,
    contact: "+92-300-3333444",
    email: "nighat.dad@cyberlaw.pk",
    bio: "Digital rights advocate and cybercrime expert with international recognition.",
    specialties: ["Cyber Law", "Digital Rights", "PECA Cases"]
  },
  {
    id: 4,
    name: "Justice (R) Nasira Javed Iqbal",
    specialization: "Constitutional Law",
    experience: 25,
    region: "Islamabad",
    rating: 5.0,
    cases: 400,
    contact: "+92-345-7777888",
    email: "nasira.iqbal@constitutional.pk",
    bio: "Retired High Court Justice with unparalleled expertise in constitutional matters.",
    specialties: ["Constitutional Law", "Supreme Court Cases", "Legal Consultation"]
  }
];

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  const handleQuestionClick = (question: string) => {
    setInitialQuestion(question);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-minimal-dark rounded-xl flex items-center justify-center">
                <Scale className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold minimal-dark tracking-tight">LegalConnect</h1>
                <p className="text-sm minimal-grey font-medium">Pakistani Legal AI Assistant</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="bg-minimal-dark text-white hover:bg-gray-800 font-medium px-6 py-2.5"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Legal Question
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold minimal-dark mb-6 leading-tight tracking-tight">
            Understand Pakistani Law in 
            <span className="text-gray-600"> Plain Terms</span>
          </h1>
          <p className="text-base minimal-grey mb-8 leading-relaxed max-w-2xl mx-auto">
            Get instant legal guidance powered by AI trained on the Pakistani Constitution, 
            Supreme Court cases, and expert legal knowledge. Available in Urdu and English.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="bg-minimal-dark text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 rounded-lg"
            >
              Start Legal Chat
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold minimal-dark mb-3 tracking-tight">Why Choose LegalConnect?</h2>
            <p className="text-sm minimal-grey">Advanced AI legal assistance built specifically for Pakistani citizens</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-sm transition-all duration-300 hover:border-gray-300">
                <CardContent className="p-5">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <Check className="text-white h-4 w-4" />
                  </div>
                  <h3 className="font-medium minimal-dark mb-2 text-sm">{feature.title}</h3>
                  <p className="text-xs minimal-grey leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold minimal-dark mb-3 tracking-tight">Common Legal Questions</h2>
            <p className="text-sm minimal-grey">Click any question to get instant legal guidance</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {commonQuestions.map((question, index) => (
              <Button
                key={index}
                onClick={() => handleQuestionClick(question)}
                variant="ghost"
                className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all h-auto group"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0 group-hover:bg-gray-800 transition-colors"></div>
                  <div>
                    <p className="font-medium minimal-dark text-xs leading-relaxed">{question}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lawyers Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold minimal-dark mb-3 tracking-tight">Featured Legal Experts</h2>
            <p className="text-sm minimal-grey">Connect with verified Pakistani lawyers specialized in different legal areas</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="border border-gray-200 hover:shadow-sm transition-all duration-300 hover:border-gray-300 bg-white">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-medium text-xs">
                        {lawyer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <h3 className="font-medium minimal-dark text-sm mb-1">{lawyer.name}</h3>
                    <p className="text-xs text-gray-600">{lawyer.specialization}</p>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-medium text-gray-800">{lawyer.experience} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Cases</span>
                      <span className="font-medium text-gray-800">{lawyer.cases}+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Rating</span>
                      <span className="font-medium text-gray-800">{lawyer.rating}/5</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-500 text-xs">{lawyer.region}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-gray-800 text-white hover:bg-gray-900 text-xs py-1.5">
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs py-1.5 border-gray-300">
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Ready to Get Legal Guidance?
          </h2>
          <p className="text-sm text-gray-300 mb-6">
            Start a conversation with our AI legal assistant trained on Pakistani law
          </p>
          <Button 
            onClick={() => setIsChatOpen(true)}
            className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Legal Chat Now
          </Button>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget 
        isOpen={isChatOpen} 
        onToggle={setIsChatOpen}
        initialQuestion={initialQuestion}
        onQuestionSet={() => setInitialQuestion("")}
      />
    </div>
  );
}