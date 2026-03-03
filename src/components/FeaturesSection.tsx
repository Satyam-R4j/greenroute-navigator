import { Wind, Shield, Zap, BarChart3, Globe, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Wind,
    title: "Real-time AQI Data",
    description: "Live air quality index from 10,000+ monitoring stations worldwide.",
  },
  {
    icon: Shield,
    title: "Health Protection",
    description: "Routes optimized to minimize your exposure to harmful pollutants.",
  },
  {
    icon: Zap,
    title: "Instant Comparison",
    description: "Compare pollution levels across multiple routes in seconds.",
  },
  {
    icon: BarChart3,
    title: "Emission Analytics",
    description: "Track your carbon savings and environmental impact over time.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Available in 150+ cities with expanding coverage every month.",
  },
  {
    icon: Smartphone,
    title: "Multi-platform",
    description: "Seamless experience across web, iOS, and Android devices.",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Features</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 mb-4 text-foreground">
            Smart Navigation, <span className="text-primary">Clean Air</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Powered by AI and real-time environmental data to find the healthiest path for you.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group bg-card rounded-2xl p-7 border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
