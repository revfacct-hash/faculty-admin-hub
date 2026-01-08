import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getYouTubeThumbnail, extractYouTubeId } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { VideoPromocional, Carrera } from "@/types/admin";

export default function VideosPromocionalesPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>(carreraId || "");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [videos, setVideos] = useState<VideoPromocional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoPromocional | null>(null);

  const selectedCarrera = carreras.find(c => c.id === selectedCarreraId);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    if (selectedCarreraId) {
      fetchVideos();
    }
  }, [selectedCarreraId]);

  useEffect(() => {
    if (carreraId && !selectedCarreraId) {
      setSelectedCarreraId(carreraId);
    }
  }, [carreraId, selectedCarreraId]);

  const fetchCarreras = async () => {
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('*')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      setCarreras(data || []);
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
      toast.error('Error al cargar las carreras');
    }
  };

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('videos_promocionales')
        .select('*')
        .eq('carrera_id', selectedCarreraId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error('Error al cargar los videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('videos_promocionales')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast.success("Video eliminado correctamente");
      setDeleteId(null);
      fetchVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error('Error al eliminar el video');
    } finally {
      setIsDeleting(false);
    }
  };

  const getVideoId = (video: VideoPromocional) => {
    return extractYouTubeId(video.url_youtube) || video.url_youtube;
  };

  if (!selectedCarreraId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Videos Promocionales</h2>
            <p className="text-muted-foreground">Selecciona una carrera para ver sus videos promocionales</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Carrera</label>
              <Select value={selectedCarreraId} onValueChange={setSelectedCarreraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una carrera" />
                </SelectTrigger>
              <SelectContent>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Select value={selectedCarreraId} onValueChange={setSelectedCarreraId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <h2 className="text-2xl font-bold">Videos Promocionales - {selectedCarrera?.nombre}</h2>
              <p className="text-muted-foreground">Gestiona los videos promocionales de la carrera</p>
            </div>
          </div>
        </div>
        <Link to={`/admin/videos-promocionales/${selectedCarreraId}/crear`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Video
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay videos promocionales registrados</p>
            <Link to={`/admin/videos-promocionales/${selectedCarreraId}/crear`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const videoId = getVideoId(video);
            return (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={getYouTubeThumbnail(videoId)}
                    alt={video.titulo || "Video"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setPreviewVideo(video)}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {video.titulo || "Sin título"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {video.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {video.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <StatusBadge active={video.activo} />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewVideo(video)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Link to={`/admin/videos-promocionales/${selectedCarreraId}/editar/${video.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(video.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-10 right-0 text-white"
              onClick={() => setPreviewVideo(null)}
            >
              ×
            </Button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getVideoId(previewVideo)}`}
                title={previewVideo.titulo || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar video?"
        description="Esta acción eliminará el video promocional permanentemente."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
