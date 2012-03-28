from django.contrib import admin
from models import Algorithm, ExecutionTrace

# So you can add tags that go under a facet from the facet creation / editing page
class TraceInline(admin.TabularInline):
    model = ExecutionTrace
    extra = 1

class AlgorithmAdmin(admin.ModelAdmin):

    inlines = [TraceInline]


admin.site.register(Algorithm, AlgorithmAdmin)