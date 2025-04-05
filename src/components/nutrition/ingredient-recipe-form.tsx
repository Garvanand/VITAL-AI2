'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Search, Loader2 } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FormSchema = z.object({
  ingredients: z.array(z.string()).nonempty({ message: 'Add at least one ingredient' }),
  dietaryPreferences: z.array(z.string()).optional(),
  mealType: z.string().min(1, { message: 'Please select a meal type' }),
  healthFocus: z.array(z.string()).optional(),
  excludeIngredients: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
];

const DIETARY_PREFERENCES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'low-fat', label: 'Low-Fat' },
  { value: 'high-protein', label: 'High-Protein' },
];

const HEALTH_FOCUS = [
  { value: 'heart-health', label: 'Heart Health' },
  { value: 'weight-management', label: 'Weight Management' },
  { value: 'muscle-building', label: 'Muscle Building' },
  { value: 'energy-boost', label: 'Energy Boost' },
  { value: 'immune-support', label: 'Immune Support' },
  { value: 'digestive-health', label: 'Digestive Health' },
  { value: 'blood-sugar', label: 'Blood Sugar Control' },
  { value: 'brain-health', label: 'Brain Health' },
  { value: 'anti-inflammatory', label: 'Anti-Inflammatory' },
];

interface IngredientRecipeFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
  error: string | null;
}

export function IngredientRecipeForm({ onSubmit, isLoading, error }: IngredientRecipeFormProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [newExcludedIngredient, setNewExcludedIngredient] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ingredients: [],
      dietaryPreferences: [],
      mealType: '',
      healthFocus: [],
      excludeIngredients: [],
    },
  });

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      const currentIngredients = form.getValues('ingredients') || [];
      form.setValue('ingredients', [...currentIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const currentIngredients = form.getValues('ingredients') || [];
    form.setValue(
      'ingredients',
      currentIngredients.filter((_, i) => i !== index),
    );
  };

  const handleAddExcludedIngredient = () => {
    if (newExcludedIngredient.trim()) {
      const currentExcluded = form.getValues('excludeIngredients') || [];
      form.setValue('excludeIngredients', [...currentExcluded, newExcludedIngredient.trim()]);
      setNewExcludedIngredient('');
    }
  };

  const handleRemoveExcludedIngredient = (index: number) => {
    const currentExcluded = form.getValues('excludeIngredients') || [];
    form.setValue(
      'excludeIngredients',
      currentExcluded.filter((_, i) => i !== index),
    );
  };

  const handleToggleDietaryPreference = (preference: string) => {
    const currentPreferences = form.getValues('dietaryPreferences') || [];

    if (currentPreferences.includes(preference)) {
      form.setValue(
        'dietaryPreferences',
        currentPreferences.filter((p) => p !== preference),
      );
    } else {
      form.setValue('dietaryPreferences', [...currentPreferences, preference]);
    }
  };

  const handleToggleHealthFocus = (focus: string) => {
    const currentFocus = form.getValues('healthFocus') || [];

    if (currentFocus.includes(focus)) {
      form.setValue(
        'healthFocus',
        currentFocus.filter((f) => f !== focus),
      );
    } else {
      form.setValue('healthFocus', [...currentFocus, focus]);
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    if (values.ingredients.length === 0) {
      form.setError('ingredients', {
        type: 'manual',
        message: 'Please add at least one ingredient',
      });
      return;
    }

    if (!values.mealType) {
      form.setError('mealType', {
        type: 'manual',
        message: 'Please select a meal type',
      });
      return;
    }

    onSubmit(values);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-lg font-medium">Ingredients You Have</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {field.value.map((ingredient, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                          {ingredient}
                          <X className="ml-2 h-4 w-4 cursor-pointer" onClick={() => handleRemoveIngredient(index)} />
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter an ingredient"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIngredient();
                            }
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleAddIngredient} disabled={isLoading}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                    {field.value.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Add ingredients you want to cook with. Example: "chicken, rice, bell peppers"
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Meal Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="dietary-preferences">
                  <AccordionTrigger>Dietary Preferences</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DIETARY_PREFERENCES.map((pref) => {
                        const isSelected = (form.getValues('dietaryPreferences') || []).includes(pref.value);
                        return (
                          <Badge
                            key={pref.value}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5"
                            onClick={() => handleToggleDietaryPreference(pref.value)}
                          >
                            {pref.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="health-focus">
                  <AccordionTrigger>Health Focus</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {HEALTH_FOCUS.map((focus) => {
                        const isSelected = (form.getValues('healthFocus') || []).includes(focus.value);
                        return (
                          <Badge
                            key={focus.value}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5"
                            onClick={() => handleToggleHealthFocus(focus.value)}
                          >
                            {focus.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="exclude-ingredients">
                  <AccordionTrigger>Exclude Ingredients</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(form.getValues('excludeIngredients') || []).map((ingredient, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1.5 text-sm border-destructive text-destructive"
                        >
                          {ingredient}
                          <X
                            className="ml-2 h-4 w-4 cursor-pointer"
                            onClick={() => handleRemoveExcludedIngredient(index)}
                          />
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter an ingredient to exclude"
                        value={newExcludedIngredient}
                        onChange={(e) => setNewExcludedIngredient(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddExcludedIngredient();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={handleAddExcludedIngredient}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding recipes...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Recipes
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
