import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabaseCon } from "@/db_api/connection.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/models/Marketplace";
import { ImageUpload } from "@/components/image-upload";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]),
  category: z.string({
    required_error: "Please select a category.",
  }),
  images: z.array(z.string()).nonempty({
    message: "Please upload at least one image.",
  }),
});

export default function MarketplaceNew() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSell, setCanSell] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      condition: "New",
      category: "",
      images: [],
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const checkSeller = async () => {
      try {
        const res = await supabaseCon.checkSellerStatus(currentUser?.user_id);
        setCanSell(res ?? false);
      } catch (error) {
        console.error("Error checking seller status:", error);
        toast.error("Failed to verify seller status");
      }
    };

    checkSeller();
  }, [isAuthenticated, navigate, currentUser]);

  if (!isAuthenticated || !canSell) return null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const listingResult = await supabaseCon.listItemsToMarketPlace(
        values.title,
        values.description,
        values.price,
        currentUser?.user_id,
        values.condition,
        values.category,
        values.images
      );

      if (!listingResult.success) {
        console.error("Listing failed:", listingResult.error);
        toast.error("Failed to list item: " + listingResult.error);
        setIsSubmitting(false);
        return;
      }

      let itemId: string | undefined;
      if (listingResult.data) {
        if (
          Array.isArray(listingResult.data) &&
          listingResult.data.length > 0 &&
          typeof listingResult.data[0]?.id === "string"
        ) {
          itemId = listingResult.data[0].id;
        } else if (
          typeof listingResult.data === "object" &&
          typeof listingResult.data.id === "string"
        ) {
          itemId = listingResult.data.id;
        }
      }

      if (itemId) {
        try {
          const notificationResult =
            await supabaseCon.createNewListingNotification(
              currentUser?.user_id,
              itemId,
              values.title
            );

          if (!notificationResult.success) {
            console.error("Notification creation failed:", notificationResult.error);
          }
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
        }
      }

      toast.success("Your item has been successfully listed on the marketplace!");

      try {
        const refreshEvent = new CustomEvent("refreshNotifications");
        window.dispatchEvent(refreshEvent);
      } catch (e) {
        console.error("Failed to trigger notification refresh:", e);
      }

      setTimeout(() => {
        navigate("/marketplace");
      }, 300);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to list item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="List Item for Sale">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    maxImages={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Calculus Textbook - 11th Edition"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your item in detail. Include any relevant information about its condition, features, etc."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-grambling-gold hover:bg-grambling-gold/90 text-grambling-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Listing..." : "List Item for Sale"}
          </Button>
        </form>
      </Form>
    </AppLayout>
  );
}
