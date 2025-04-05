'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

interface SkinDiseaseAssessmentProps {
  session: any;
  supabase: any;
}

export function SkinDiseaseAssessment({ session, supabase }: SkinDiseaseAssessmentProps) {
  const [formData, setFormData] = useState({
    symptoms: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatReport = (content: string) => {
    // Sample format of a structured report without using 's' flag regex
    const diagnosisMatch = content?.match(/Diagnosis:?(.*?)(?=(Possible Causes:|Recommended Steps:|$))/);
    const causesMatch = content?.match(/Possible Causes:?(.*?)(?=(Recommended Steps:|$))/);
    const stepsMatch = content?.match(/Recommended Steps:?(.*)/);

    const sections = {
      diagnosis: diagnosisMatch?.[1]?.trim() || 'Eczema (Atopic Dermatitis)',
      causes: causesMatch?.[1]?.trim() || 'Genetic factors, immune system dysfunction, environmental triggers, stress',
      steps:
        stepsMatch?.[1]?.trim() ||
        'Moisturize regularly, avoid triggers, use prescribed medications, follow a gentle skincare routine',
    };

    return sections;
  };

  // Simulation of API call that would use .pkl files
  const simulateAnalysis = async () => {
    // This is where the actual API call would happen
    // For demo purposes, we're returning sample data
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    const sampleResponse = `
      Diagnosis: Eczema (Atopic Dermatitis)
      
      Possible Causes: Genetic factors, immune system dysfunction, environmental triggers, stress
      
      Recommended Steps: Moisturize regularly, avoid triggers, use prescribed medications, follow a gentle skincare routine
    `;

    return sampleResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real application, this would call a backend API that uses the ML model
      const response = await simulateAnalysis();
      const formattedResult = formatReport(response);

      const riskLevel = formattedResult.diagnosis.toLowerCase().includes('severe') ? 'high' : 'medium';
      const followUpRequired =
        formattedResult.steps.toLowerCase().includes('consult') ||
        formattedResult.steps.toLowerCase().includes('see a doctor');

      setResult({
        ...formattedResult,
        risk_level: riskLevel,
        confidence_score: 85,
        follow_up_required: followUpRequired,
      });

      // Save to Supabase if user is logged in
      if (session?.user?.id && supabase) {
        try {
          // Upload image to Supabase Storage
          const fileExt = formData.image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('skin-images')
            .upload(filePath, formData.image, {
              cacheControl: '3600',
              upsert: false,
              contentType: formData.image.type,
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error('Failed to upload image');
          }

          // Get the public URL for the uploaded image
          const {
            data: { publicUrl },
          } = supabase.storage.from('skin-images').getPublicUrl(filePath);

          // Save assessment data to Supabase
          const { error: saveError } = await supabase.from('skin_assessments').insert([
            {
              user_id: session.user.id,
              diagnosis: formattedResult.diagnosis,
              possible_causes: formattedResult.causes,
              recommendations: formattedResult.steps,
              risk_level: riskLevel,
              symptoms: formData.symptoms,
              image_url: publicUrl,
              confidence_score: 0.85,
              follow_up_required: followUpRequired,
              treatment_plan: {
                diagnosis: formattedResult.diagnosis,
                causes: formattedResult.causes,
                recommendations: formattedResult.steps,
              },
              created_at: new Date().toISOString(),
            },
          ]);

          if (saveError) {
            console.error('Error saving to Supabase:', saveError);
            throw new Error('Failed to save assessment');
          }
        } catch (err) {
          console.error('Error in Supabase operations:', err);
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">AI Skin Condition Analyzer</h2>
              <p className="text-muted-foreground mt-2">
                Upload a clear image of the affected skin area for analysis. For best results, ensure good lighting and
                focus.
              </p>
            </div>

            {error && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-md flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skin-image">Upload Skin Image</Label>

                  {!imagePreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:bg-background/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">Drag and drop an image or click to browse</p>
                        <p className="text-xs mt-1 text-muted-foreground">JPEG, PNG or GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        id="skin-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-muted">
                      <div className="aspect-video relative flex items-center justify-center bg-muted">
                        <Image src={imagePreview} alt="Skin condition preview" fill style={{ objectFit: 'contain' }} />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Additional Symptoms (Optional)</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Describe any additional symptoms or concerns..."
                    rows={3}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.image}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </form>

            {result && (
              <motion.div
                className="mt-8 border rounded-lg p-6 bg-card/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Skin Condition Analysis Report</h3>
                    <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Diagnosis</h4>
                      <p>{result.diagnosis}</p>

                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence Score:</span>
                          <span className="font-medium">{result.confidence_score}%</span>
                        </div>
                        <Progress value={result.confidence_score} className="h-2" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Risk Level</h4>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          result.risk_level === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {result.risk_level === 'high' ? 'High Risk' : 'Medium Risk'}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Possible Causes</h4>
                      <p>{result.causes}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Recommended Steps</h4>
                      <p>{result.steps}</p>

                      {result.follow_up_required && (
                        <div className="mt-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 p-3 rounded-md flex items-center">
                          <AlertCircle className="mr-2 h-5 w-5" />
                          <span>Medical Follow-up Required</span>
                        </div>
                      )}
                    </div>

                    {formData.symptoms && (
                      <div>
                        <h4 className="text-lg font-medium mb-2">Reported Symptoms</h4>
                        <p>{formData.symptoms}</p>
                      </div>
                    )}

                    <div className="text-sm bg-muted/30 p-4 rounded-md">
                      <p className="font-medium mb-1">Medical Disclaimer</p>
                      <p>
                        This AI-generated analysis is for informational purposes only and should not be considered as a
                        medical diagnosis. Please consult a qualified healthcare professional for proper medical advice
                        and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
