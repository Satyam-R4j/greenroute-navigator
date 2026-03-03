import { MapPin, BarChart3, Navigation, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: MapPin, title: "Enter Locations", desc: "Set your starting point and destination." },
  { icon: BarChart3, title: "Analyze Pollution", desc: "We scan real-time air quality data across all routes." },
  { icon: Navigation, title: "Compare Routes", desc: "See pollution levels, distance, and time for each option." },
  { icon: ThumbsUp, title: "Go Green", desc: "Pick the cleanest route and breathe easy." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 mb-4 text-foreground">
            Four Simple <span className="text-primary">Steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 relative">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
